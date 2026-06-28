import { isValidYoutubeLink, extractVideoId } from "../../common/utils/youtubeLink.utils.js"
import ApiError from "../../common/errors/ApiError.js"
import { RedisSortedSet } from "../redis/redis.sortedSet.js"
import { RedisRateLimitAndVotes } from "../redis/redis.rateLimitAndVotes.js"
import { emitToRoom } from "../redis/redis.pubsub.js"
import { NowPlayingService } from "../nowPlaying/nowPlaying.service.js"
import db from "../../db/index.js"
import { spaces, users } from "../../db/schema.js"
import { eq } from "drizzle-orm"

class SongService {

  static async addSong(spaceId: string, guestUuid: string, youtubeURL: string, clerkUserId?: string | null) {
    try {
      if (youtubeURL.includes("/shorts/") || youtubeURL.includes("/live/")) {
        throw ApiError.badRequest("Shorts and Live streams are not supported")
      }

      const videoId = extractVideoId(youtubeURL)
      if (!videoId) {
        throw ApiError.badRequest("Invalid youtube URL")
      }

      const normalizedURL = `https://www.youtube.com/watch?v=${videoId}`

      // Check if space exists and determine if the user is the creator
      const spaceResult = await db.select().from(spaces).where(eq(spaces.id, spaceId)).limit(1)
      if (spaceResult.length === 0) {
        throw ApiError.notFound("Space not found")
      }
      const space = spaceResult[0]

      let isCreator = false
      if (clerkUserId) {
        const userResult = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1)
        if (userResult.length > 0 && space.userId === userResult[0].id) {
          isCreator = true
        }
      }

      const queueSize = await RedisSortedSet.queueSize(spaceId)
      if (queueSize >= 30) {
        throw ApiError.badRequest("Queue is full")
      }

      const queueItems = await RedisSortedSet.getFullQueue(spaceId)
      const isSongInQueue = queueItems.some(item => item.value === videoId)
      if (isSongInQueue) {
        throw ApiError.badRequest("Song is already in the queue")
      }

      if (!isCreator) {
        const isUnderLimit = await RedisRateLimitAndVotes.isUnderRateLimit(spaceId, guestUuid, 3)
        if (!isUnderLimit) {
          throw ApiError.badRequest("Rate limit exceeded")
        }
      }

      let title = ""
      let thumbnail = ""
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedURL)}&format=json`)
        if (!response.ok) {
          throw new Error("oembed response not OK")
        }
        const data = await response.json() as any
        title = data.title
        thumbnail = data.thumbnail_url
      } catch (error) {
        throw ApiError.badRequest("video not found or unavailable")
      }

      if (!title || !thumbnail) {
        throw ApiError.badRequest("video not found or unavailable")
      }

      const song = {
        title,
        url: youtubeURL,
        thumbnail,
        addedBy: guestUuid,
        spaceId
      }

      await RedisSortedSet.addToQueue(spaceId, videoId)
      await RedisSortedSet.saveSongMetadata(spaceId, videoId, {
        title: song.title,
        url: song.url,
        thumbnail: song.thumbnail,
        addedBy: song.addedBy
      })

      await RedisRateLimitAndVotes.incrementRateLimit(spaceId, guestUuid)

      // Try starting playback if it's the only/first song added
      await NowPlayingService.tryStartPlayback(spaceId)

      const queue = await RedisSortedSet.getMergedQueue(spaceId)

      emitToRoom("queueUpdated", { queue }, spaceId)

      return song
    } catch (error) {
      throw error
    }
  }

  static async getSpaceSongs(spaceId: string) {
    return RedisSortedSet.getMergedQueue(spaceId)
  }
}

export default SongService