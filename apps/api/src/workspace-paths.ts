import path from "node:path";
import { BadRequestException } from "@nestjs/common";
import { fileNameFromPath } from "@slideleaf/shared";
import { validateWorkspacePath } from "@slideleaf/workspace";

export function normalizeClientPath(input: string): string {
  try {
    const normalized = validateWorkspacePath(input);
    if (normalized.length > 512) {
      throw new Error("Workspace path is too long");
    }
    return normalized;
  } catch (error) {
    throw new BadRequestException(error instanceof Error ? error.message : String(error));
  }
}

export function parentPathFor(filePath: string): string | null {
  const parent = path.posix.dirname(filePath);
  return parent === "." ? null : parent;
}

export function nameFor(filePath: string): string {
  return fileNameFromPath(filePath);
}

export function childPath(parentPath: string | null, name: string): string {
  const cleanName = normalizeClientPath(name);
  if (cleanName.includes("/")) {
    throw new BadRequestException("Names cannot contain path separators");
  }
  return parentPath ? `${parentPath}/${cleanName}` : cleanName;
}
