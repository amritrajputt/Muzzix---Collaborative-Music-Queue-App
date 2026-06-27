import dotenv from "dotenv"
import { RedisBase } from "./redis.base.js"
dotenv.config()

export interface SongMetadata {
  title: string
  url: string
  thumbnail: string
  addedBy: string
  duration?: number
}

export class RedisSortedSet extends RedisBase {

  static async addToQueue(spaceId: string, songId: string) {
    await this.connect()
    const key = `queue:${spaceId}`
    const score = 0
    await this.client.zAdd(key, {
      score,
      value: songId
    })
  }
  static async incrementVote(spaceId: string, songId: string) {
    await this.connect()
    const key = `queue:${spaceId}`
    await this.client.zIncrBy(key, 1, songId)
    return this.client.zRangeWithScores(key, 0, -1, { REV: true })
  }

  static async getFullQueue(spaceId: string) {
    await this.connect()
    const key = `queue:${spaceId}`
    return this.client.zRangeWithScores(key, 0, -1, { REV: true })
  }
  static async removeSongFromQueue(spaceId: string, songId: string) {
    await this.connect()
    const key = `queue:${spaceId}`
    await this.client.zRem(key, songId)
  }
  static async queueSize(spaceId: string) {
    await this.connect()
    const key = `queue:${spaceId}`
    return this.client.zCard(key)
  }
  static async saveSongMetadata(spaceId: string, songId: string, songMetadata: SongMetadata) {
    await this.connect()
    const key = `song:${spaceId}:${songId}`
    const fields: Record<string, string | number> = {
      title: songMetadata.title,
      url: songMetadata.url,
      thumbnail: songMetadata.thumbnail,
      addedBy: songMetadata.addedBy
    }
    if (songMetadata.duration !== undefined) {
      fields.duration = songMetadata.duration
    }
    await this.client.hSet(key, fields)
  }

  static async getSongMetadata(spaceId: string, songId: string): Promise<SongMetadata | null> {
    await this.connect()
    const key = `song:${spaceId}:${songId}`
    const data = await this.client.hGetAll(key)
    if (!data || Object.keys(data).length === 0) return null
    const result: SongMetadata = {
      title: data.title || '',
      url: data.url || '',
      thumbnail: data.thumbnail || '',
      addedBy: data.addedBy || ''
    }
    if (data.duration !== undefined) {
      result.duration = Number(data.duration)
    }
    return result
  }

  static async setNowPlaying(
    spaceId: string,
    songInfo: { songId: string, title: string, url: string, thumbnail: string, startedAt: number, duration?: number, isPlaying?: boolean, pausedAt?: number }
  ) {
    await this.connect()
    const key = `nowPlaying:${spaceId}`
    const fields: Record<string, string> = {
      songId: songInfo.songId,
      title: songInfo.title,
      url: songInfo.url,
      thumbnail: songInfo.thumbnail,
      startedAt: songInfo.startedAt.toString()
    }
    if (songInfo.duration !== undefined) {
      fields.duration = songInfo.duration.toString()
    }
    if (songInfo.isPlaying !== undefined) {
      fields.isPlaying = songInfo.isPlaying.toString()
    } else {
      fields.isPlaying = "true"
    }
    if (songInfo.pausedAt !== undefined && songInfo.pausedAt !== null) {
      fields.pausedAt = songInfo.pausedAt.toString()
    } else {
      await this.client.hDel(key, "pausedAt")
    }
    await this.client.hSet(key, fields)
  }

  static async getNowPlaying(spaceId: string) {
    await this.connect()
    const key = `nowPlaying:${spaceId}`
    const data = await this.client.hGetAll(key)
    if (!data || Object.keys(data).length === 0) return null
    const result: { songId: string, title: string, url: string, thumbnail: string, startedAt: number, duration?: number, isPlaying?: boolean, pausedAt?: number } = {
      songId: data.songId,
      title: data.title,
      url: data.url,
      thumbnail: data.thumbnail,
      startedAt: Number(data.startedAt)
    }
    if (data.duration !== undefined) {
      result.duration = Number(data.duration)
    }
    if (data.isPlaying !== undefined) {
      result.isPlaying = data.isPlaying === "true"
    } else {
      result.isPlaying = true
    }
    if (data.pausedAt !== undefined) {
      result.pausedAt = Number(data.pausedAt)
    }
    return result
  }

  static async clearNowPlaying(spaceId: string) {
    await this.connect()
    const key = `nowPlaying:${spaceId}`
    await this.client.del(key)
  }

  static async saveMemberName(spaceId: string, guestUuid: string, guestName: string) {
    await this.connect()
    const key = `members:${spaceId}`
    await this.client.hSet(key, guestUuid, guestName)
  }

  static async getMergedQueue(spaceId: string) {
    const queueItems = await this.getFullQueue(spaceId)
    const mergedQueue = []
    const membersKey = `members:${spaceId}`
    for (const item of queueItems) {
      const metadata = await this.getSongMetadata(spaceId, item.value)
      const guestUuid = metadata?.addedBy || ''
      
      let displayName = guestUuid
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestUuid)) {
        await this.connect()
        const name = await this.client.hGet(membersKey, guestUuid)
        displayName = name || "Guest"
      }

      mergedQueue.push({
        songId: item.value,
        votes: item.score,
        title: metadata?.title || '',
        url: metadata?.url || '',
        thumbnail: metadata?.thumbnail || '',
        addedBy: displayName,
        duration: metadata?.duration
      })
    }
    return mergedQueue
  }
}
