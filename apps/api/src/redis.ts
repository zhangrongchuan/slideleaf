import type { RedisOptions } from "bullmq";

export function redisConnectionFromEnv(): RedisOptions {
  const raw = process.env.REDIS_URL ?? "redis://localhost:6379";
  const url = new URL(raw);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined
  };
}
