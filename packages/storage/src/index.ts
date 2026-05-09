import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";

export interface ObjectStorage {
  upload(key: string, body: Buffer | Readable, contentType?: string): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  ensureBucket?(): Promise<void>;
  getSignedUploadUrl?(key: string, contentType: string): Promise<string>;
}

export type S3ObjectStorageOptions = {
  endpoint: string;
  publicEndpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
};

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicEndpoint: string;

  constructor(options: S3ObjectStorageOptions) {
    this.bucket = options.bucket;
    this.publicEndpoint = options.publicEndpoint ?? options.endpoint;
    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      forcePathStyle: options.forcePathStyle ?? true,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
      }
    });
  }

  async upload(key: string, body: Buffer | Readable, contentType?: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: normalizeKey(key),
        Body: body,
        ContentType: contentType
      })
    );
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: normalizeKey(key)
      })
    );

    if (!result.Body) {
      return Buffer.alloc(0);
    }

    const body = result.Body as Readable & {
      transformToByteArray?: () => Promise<Uint8Array>;
    };

    if (typeof body.transformToByteArray === "function") {
      return Buffer.from(await body.transformToByteArray());
    }

    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalizeKey(key)
      })
    );
  }

  getPublicUrl(key: string): string {
    const base = this.publicEndpoint.replace(/\/$/, "");
    return `${base}/${this.bucket}/${encodeURI(normalizeKey(key))}`;
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }
}

export function createStorageFromEnv(env: NodeJS.ProcessEnv = process.env): ObjectStorage {
  const required = [
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY"
  ] as const;

  for (const name of required) {
    if (!env[name]) {
      throw new Error(`Missing storage environment variable: ${name}`);
    }
  }

  return new S3ObjectStorage({
    endpoint: env.S3_ENDPOINT!,
    publicEndpoint: env.S3_PUBLIC_ENDPOINT,
    region: env.S3_REGION!,
    bucket: env.S3_BUCKET!,
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    forcePathStyle: env.S3_FORCE_PATH_STYLE !== "false"
  });
}

export function normalizeKey(key: string): string {
  return key.replace(/\\/g, "/").replace(/^\/+/, "");
}

export function contentTypeForPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
