import "server-only";
import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const globalRedis = globalThis as typeof globalThis & {
	MamestaRedis?: RedisClient,
	MamestaRedisConnection?: Promise<RedisClient>
};

const port = Number(process.env.REDIS_PORT);
const database = Number(process.env.REDIS_DB);

const redis = globalRedis.MamestaRedis ?? createClient({
	socket: {
		host: process.env.REDIS_HOST ?? "127.0.0.1",
		port: Number.isInteger(port) && port > 0 ? port : 6379,
		connectTimeout: 2500,
		reconnectStrategy: false
	},
	username: process.env.REDIS_USER || undefined,
	password: process.env.REDIS_PASS || undefined,
	database: Number.isInteger(database) && database >= 0 ? database : 0
});

redis.on("error", () => {
	// Rank history is optional UI data. Callers handle connection failures.
});

globalRedis.MamestaRedis = redis;

export async function getRedisClient() {
	if (redis.isOpen) return redis;

	globalRedis.MamestaRedisConnection ??= redis.connect()
		.then(() => redis)
		.catch((error) => {
			globalRedis.MamestaRedisConnection = undefined;
			throw error;
		});

	return globalRedis.MamestaRedisConnection;
}
