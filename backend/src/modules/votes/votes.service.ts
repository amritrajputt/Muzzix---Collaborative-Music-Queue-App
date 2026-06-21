import ApiError from "../../common/errors/ApiError.js"
import { RedisSortedSet } from "../redis/redis.sortedSet.js"
import { RedisRateLimitAndVotes } from "../redis/redis.rateLimitAndVotes.js"
import { emitToRoom } from "../redis/redis.pubsub.js"

interface CreateVoteInput {
  spaceId: string
  songId: string
  guestUuid: string
}

export class VoteService {
   static async createVote({ spaceId, songId, guestUuid }: CreateVoteInput) {
       const isVoted = await RedisRateLimitAndVotes.hasUserVoted(spaceId, guestUuid, songId)
       if (isVoted) {
           throw ApiError.badRequest("You have already voted for this song")
       }
       
       await RedisSortedSet.incrementVote(spaceId, songId)
       await RedisRateLimitAndVotes.markAsVoted(spaceId, songId, guestUuid)
       
       const queue = await RedisSortedSet.getMergedQueue(spaceId)
       emitToRoom("queueUpdated", { queue }, spaceId)
       
       return queue
   }
}