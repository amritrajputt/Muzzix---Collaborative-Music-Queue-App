import { createClient } from "redis"
import dotenv from "dotenv"
dotenv.config()

export class RedisBase {
  protected static client = createClient({
    url: process.env.REDIS_URL
  })

  private static connectPromise: Promise<any> | null = null

  protected static async connect() {
    if (!RedisBase.connectPromise) {
      RedisBase.connectPromise = RedisBase.client.connect().catch((err) => {
        RedisBase.connectPromise = null
        throw err
      })
    }
    await RedisBase.connectPromise
  }
}
