import { RedisBase } from "./redis.base.js"

export class RedisRateLimitAndVotes extends RedisBase {
  static async hasUserVoted(spaceId: string, guestUuid: string, songId: string): Promise<boolean> {
    await this.connect()
    const key = `voted:${spaceId}:${songId}`
    return this.client.sIsMember(key, guestUuid)
  }

  static async markAsVoted(spaceId: string, songId: string, guestUuid: string): Promise<void> {
    await this.connect()
    const key = `voted:${spaceId}:${songId}`
    await this.client.sAdd(key, guestUuid)
  }

  static async clearVotes(spaceId: string, songId: string): Promise<void> {
    await this.connect()
    const key = `voted:${spaceId}:${songId}`
    await this.client.del(key)
  }

  static async incrementRateLimit(spaceId: string, guestUuid: string, expirySeconds: number = 1800): Promise<number> {
    await this.connect()
    const key = `rateLimit:${spaceId}:${guestUuid}`
    const count = await this.client.incr(key)
    if (count === 1) {
      await this.client.expire(key, expirySeconds)
    }
    return count
  }
  
  static async isUnderRateLimit(spaceId: string, guestUuid: string, maxRequests: number): Promise<boolean> {
    await this.connect()
    const key = `rateLimit:${spaceId}:${guestUuid}`
    const count = await this.client.get(key)
    if (!count) {
      return true
    }
    if (parseInt(count) < maxRequests) {
      return true
    } else {
      return false
    }
  }
}