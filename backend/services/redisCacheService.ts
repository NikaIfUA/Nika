import { createClient } from "redis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../env.ts";

type RedisClient = ReturnType<typeof createClient>;

class RedisCacheService {
  private static client: RedisClient | null = null;
  private static isDisabled = false;

  private static async getClient(): Promise<RedisClient | null> {
    if (RedisCacheService.isDisabled) {
      return null;
    }

    if (RedisCacheService.client?.isOpen) {
      return RedisCacheService.client;
    }

    try {
      const authPart = REDIS_PASSWORD ? `:${encodeURIComponent(REDIS_PASSWORD)}@` : "";
      const redisUrl = `redis://${authPart}${REDIS_HOST}:${REDIS_PORT}`;

      const client = createClient({ url: redisUrl });
      await client.connect();
      RedisCacheService.client = client;
      return client;
    } catch (error) {
      console.warn("Redis is unavailable, cache fallback to DB:", error);
      RedisCacheService.isDisabled = true;
      return null;
    }
  }

  public static async getJson<T>(key: string): Promise<T | null> {
    const client = await RedisCacheService.getClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public static async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const client = await RedisCacheService.getClient();
    if (!client) {
      return;
    }

    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  public static async del(key: string): Promise<void> {
    const client = await RedisCacheService.getClient();
    if (!client) {
      return;
    }

    await client.del(key);
  }
}

export default RedisCacheService;
