import Redis from "ioredis";


export const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6380");
export const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6380");
