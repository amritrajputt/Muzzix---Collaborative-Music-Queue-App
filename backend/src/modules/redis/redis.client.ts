import Redis from 'ioredis';

export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6380");

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});

