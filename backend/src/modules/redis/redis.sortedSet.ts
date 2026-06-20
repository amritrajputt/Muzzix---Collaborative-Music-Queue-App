import { createClient } from "redis"
import dotenv from "dotenv"
dotenv.config()

class RedisSortedSet {
    
  private static client = createClient({
    url: process.env.REDIS_URL
  })

  // Flag to check if connection has been initialized
  private static isConnected = false

  private static async connect() {
    if (!this.isConnected) {
      await this.client.connect()
      this.isConnected = true
    }
  }

  static async addToQueue(spaceId: string, songId: string) {
    await this.connect() 
    const key = `queue:${spaceId}`
    const score = 0
    await this.client.zAdd(key, {
      score,
      value: songId
    })
  }
}
