import { Request, Response, NextFunction } from "express";
import { redisClient } from "../../modules/redis/redis.client.js";

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-idempotency-key"];

  // Skip middleware if client didn't supply an idempotency key
  if (!key || typeof key !== "string") {
    return next();
  }

  const redisLockKey = `idempotency:lock:${key}`;
  const redisResponseKey = `idempotency:resp:${key}`;

  try {
    // 1. Try to lock the key in Redis (NX = Set if Not Exists, PX = Expires in 15 seconds)
    const result = await redisClient.set(redisLockKey, "IN_PROGRESS", "PX", 15000, "NX");

    if (result !== "OK") {
      // 2. The key exists. Check if the response is already cached
      const cachedResponse = await redisClient.get(redisResponseKey);
      if (cachedResponse) {
        const { statusCode, body } = JSON.parse(cachedResponse);
        res.setHeader("X-Cache-Idempotent", "true");
        res.status(statusCode).json(body);
        return;
      }

      // 3. Lock exists but no cached response yet -> first request is still processing
      res.status(409).json({
        success: false,
        message: "Duplicate request in progress. Please wait.",
      });
      return;
    }

    // Override res.json to capture and cache the response when completed
    const originalJson = res.json;
    
    res.json = function (body: any) {
      res.json = originalJson;

      redisClient.set(redisResponseKey, JSON.stringify({ statusCode: res.statusCode, body }), "EX", 3600).catch(() => {});
      redisClient.del(redisLockKey).catch(() => {});

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error("Idempotency middleware error:", error);
    next(error);
  }
};
