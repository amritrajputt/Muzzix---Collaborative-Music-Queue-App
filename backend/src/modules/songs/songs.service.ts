import { isValidYoutubeLink, extractVideoId } from "../../common/utils/youtubeLink.utils.js"
import ApiError from "../../common/errors/ApiError.js"
import { RedisSortedSet } from "../redis/redis.sortedSet.js" 
import { RedisRateLimitAndVotes } from "../redis/redis.rateLimitAndVotes.js" 
import { emitToRoom } from "../redis/redis.pubsub.js"
import { NowPlayingService } from "../nowPlaying/nowPlaying.service.js"

class SongService {

    static async addSong(spaceId: string, guestUuid: string, youtubeURL: string) {
        try {
           if (!isValidYoutubeLink(youtubeURL)) {
             throw ApiError.badRequest("Invalid youtube URL")
           }

           const videoId = extractVideoId(youtubeURL)
           if (!videoId) {
             throw ApiError.badRequest("Invalid youtube URL")
           }

           const queueSize = await RedisSortedSet.queueSize(spaceId)
           if (queueSize >= 30) {
             throw ApiError.badRequest("Queue is full")
           }

           const isAlreadyAdded = await RedisSortedSet.getSongMetadata(spaceId, videoId)
           if (isAlreadyAdded) {
             throw ApiError.badRequest("Song is already added")
           }

           const isUnderLimit = await RedisRateLimitAndVotes.isUnderRateLimit(spaceId, guestUuid, 3)
           if (!isUnderLimit) {
             throw ApiError.badRequest("Rate limit exceeded")
           }

           let title = ""
           let thumbnail = ""
           try {
             const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeURL)}&format=json`)
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