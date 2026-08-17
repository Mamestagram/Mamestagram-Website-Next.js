import "server-only";
import { createClient } from "redis";

const createRedisConnection = () => {
  const port = Number(process.env.REDIS_PORT);
  const database = Number(process.env.REDIS_DB);
  const redis = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number.isInteger(port) && port > 0 ? port : 6379,
      connectTimeout: 2500,
      reconnectStrategy: false,
    },
    username: process.env.REDIS_USER || undefined,
    password: process.env.REDIS_PASS || undefined,
    database: Number.isInteger(database) && database >= 0 ? database : 0,
  });

  redis.on("error", () => {
    // Rank history is optional UI data. Callers handle connection failures.
  });

  return redis;
};

type RedisClient = ReturnType<typeof createRedisConnection>;

const globalRedis = globalThis as typeof globalThis & {
  MamestaRedis?: RedisClient;
  MamestaRedisConnection?: Promise<RedisClient>;
  MamestaRedisConnectingClient?: RedisClient;
};

const discardRedisClient = (redis: RedisClient) => {
  if (redis.isOpen) redis.destroy();
  if (globalRedis.MamestaRedis === redis) globalRedis.MamestaRedis = undefined;
};

export async function getRedisClient() {
  const currentRedis = globalRedis.MamestaRedis;
  if (currentRedis?.isReady) return currentRedis;

  if (
    globalRedis.MamestaRedisConnectingClient === currentRedis &&
    globalRedis.MamestaRedisConnection
  )
    return globalRedis.MamestaRedisConnection;

  // A failed connection can remain open but never become ready. Do not reuse it.
  if (currentRedis) discardRedisClient(currentRedis);

  const redis = createRedisConnection();
  globalRedis.MamestaRedis = redis;
  globalRedis.MamestaRedisConnectingClient = redis;

  const connection = redis
    .connect()
    .then(() => redis)
    .catch((error: unknown) => {
      discardRedisClient(redis);
      throw error;
    })
    .finally(() => {
      if (globalRedis.MamestaRedisConnectingClient !== redis) return;
      globalRedis.MamestaRedisConnection = undefined;
      globalRedis.MamestaRedisConnectingClient = undefined;
    });

  globalRedis.MamestaRedisConnection = connection;
  return connection;
}
