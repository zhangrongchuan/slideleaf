import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectStorage } from "@slideleaf/storage";

export type WorkspaceFileRecord = {
  id: string;
  path: string;
  kind: string;
  isBinary: boolean;
  contentText: string | null;
  storageKey: string | null;
};

export type WorkspacePrismaLike = {
  file: {
    findMany(args: {
      where: { projectId: string };
      orderBy: { path: "asc" };
    }): Promise<WorkspaceFileRecord[]>;
  };
};

export type MaterializeWorkspaceOptions = {
  projectId: string;
  targetDir: string;
  prisma: WorkspacePrismaLike;
  storage: ObjectStorage;
};

export async function materializeWorkspace(options: MaterializeWorkspaceOptions): Promise<void> {
  const targetDir = path.resolve(options.targetDir);
  await mkdir(targetDir, { recursive: true });

  const files = await options.prisma.file.findMany({
    where: { projectId: options.projectId },
    orderBy: { path: "asc" }
  });

  for (const file of files) {
    const safePath = validateWorkspacePath(file.path);
    const fullPath = resolveInside(targetDir, safePath);

    if (file.kind === "folder") {
      await mkdir(fullPath, { recursive: true });
      continue;
    }

    if (file.kind !== "file") {
      throw new Error(`Unsupported workspace entry kind for ${file.path}: ${file.kind}`);
    }

    await mkdir(path.dirname(fullPath), { recursive: true });

    if (file.isBinary) {
      if (!file.storageKey) {
        throw new Error(`Binary file ${file.path} is missing a storage key`);
      }
      const buffer = await options.storage.download(file.storageKey);
      await writeFile(fullPath, buffer);
    } else {
      await writeFile(fullPath, file.contentText ?? "", "utf8");
    }
  }
}

export function validateWorkspacePath(input: string): string {
  if (!input || input.includes("\0")) {
    throw new Error("Workspace path is empty or contains a null byte");
  }

  const normalized = input.replace(/\\/g, "/");

  if (path.posix.isAbsolute(normalized) || path.win32.isAbsolute(input)) {
    throw new Error(`Absolute workspace paths are not allowed: ${input}`);
  }

  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0 || segments.includes("..") || segments.includes(".")) {
    throw new Error(`Unsafe workspace path: ${input}`);
  }

  return segments.join("/");
}

export function resolveInside(rootDir: string, relativePath: string): string {
  const root = path.resolve(rootDir);
  const fullPath = path.resolve(root, relativePath);
  const rel = path.relative(root, fullPath);

  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Resolved path escaped workspace root: ${relativePath}`);
  }

  return fullPath;
}
