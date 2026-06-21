import { Server, Socket } from "socket.io"
import { JoinSpacePayload, LeaveSpacePayload, ReportDurationPayload } from "./socket.types.js"
import { emitToRoom } from "../redis/redis.pubsub.js"
import { NowPlayingService } from "../nowPlaying/nowPlaying.service.js"

export const registerSocketEvents = (socket: Socket, io: Server) => {
  console.log("a user connected via socket:", socket.id)

  socket.on("join-space", ({ spaceId, guestName, guestUuid }: JoinSpacePayload) => {
    socket.join(spaceId)
    socket.data.spaceId = spaceId
    socket.data.guestName = guestName
    socket.data.guestUuid = guestUuid
    emitToRoom("member-joined", { guestName, guestUuid }, spaceId)
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

  socket.on("disconnect", () => {
    const { spaceId, guestName, guestUuid } = socket.data
    if (spaceId) {
      emitToRoom("member-left", { guestName, guestUuid }, spaceId)
    }
    console.log("user disconnected:", socket.id)
  })
}