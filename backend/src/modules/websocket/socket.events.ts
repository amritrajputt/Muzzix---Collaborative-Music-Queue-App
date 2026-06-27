import { Server, Socket } from "socket.io"
import { JoinSpacePayload, LeaveSpacePayload, ReportDurationPayload } from "./socket.types.js"
import { emitToRoom } from "../redis/redis.pubsub.js"
import { NowPlayingService } from "../nowPlaying/nowPlaying.service.js"

import { RedisSortedSet } from "../redis/redis.sortedSet.js"

export const registerSocketEvents = (socket: Socket, io: Server) => {
  console.log("a user connected via socket:", socket.id)

  socket.on("join-space", async ({ spaceId, guestName, guestUuid }: JoinSpacePayload) => {
    socket.join(spaceId)
    socket.data.spaceId = spaceId
    socket.data.guestName = guestName
    socket.data.guestUuid = guestUuid
    
    try {
      await RedisSortedSet.saveMemberName(spaceId, guestUuid, guestName)
    } catch (err) {
      console.error("Error saving member name mapping on join:", err)
    }

    emitToRoom("member-joined", { guestName, guestUuid }, spaceId)

    try {
      const nowPlaying = await RedisSortedSet.getNowPlaying(spaceId)
      if (nowPlaying) {
        socket.emit("nowPlayingChanged", { song: nowPlaying })
      }
    } catch (err) {
      console.error("Error sending nowPlaying info to joining socket:", err)
    }
  })

  socket.on("leave-space", ({ spaceId, guestName, guestUuid }: LeaveSpacePayload) => {
    socket.leave(spaceId)
    emitToRoom("member-left", { guestName, guestUuid }, spaceId)
  })

  socket.on("report-duration", async ({ spaceId, songId, duration }: ReportDurationPayload) => {
    try {
      await NowPlayingService.onDurationReported(spaceId, songId, duration)
    } catch (error) {
      console.error(`Error handling report-duration:`, error)
    }
  })

  socket.on("song-ended", async ({ spaceId, songId }: { spaceId: string, songId: string }) => {
    try {
      const nowPlaying = await RedisSortedSet.getNowPlaying(spaceId)
      if (nowPlaying && nowPlaying.songId === songId) {
        await NowPlayingService.advanceToNextSong(spaceId)
      }
    } catch (error) {
      console.error(`Error handling song-ended:`, error)
    }
  })

  socket.on("ping-server-time", ({ clientSentAt }: { clientSentAt: number }) => {
    socket.emit("pong-server-time", {
      clientSentAt,
      serverTime: Date.now()
    })
  })

  socket.on("disconnect", () => {
    const { spaceId, guestName, guestUuid } = socket.data
    if (spaceId) {
      emitToRoom("member-left", { guestName, guestUuid }, spaceId)
    }
    console.log("user disconnected:", socket.id)
  })
}