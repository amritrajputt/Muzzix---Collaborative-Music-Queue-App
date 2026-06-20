import { Server, Socket } from "socket.io"
import { JoinSpacePayload, LeaveSpacePayload } from "./socket.types.js"
import { emitToRoom } from "./socket.server.js"

export const registerSocketEvents = (socket: Socket, io: Server) => {
  console.log("a user connected via socket:", socket.id)

  socket.on("join-space", ({ spaceId, guestName }: JoinSpacePayload) => {
    socket.join(spaceId)
    socket.data.spaceId = spaceId
    socket.data.guestName = guestName
    emitToRoom("member-joined", { guestName }, spaceId)
  })

  socket.on("leave-space", ({ spaceId, guestName }: LeaveSpacePayload) => {
    socket.leave(spaceId)
    emitToRoom("member-left", { guestName }, spaceId)
  })

  socket.on("disconnect", () => {
    const { spaceId, guestName } = socket.data
    if (spaceId) {
      emitToRoom("member-left", { guestName }, spaceId)
    }
    console.log("user disconnected:", socket.id)
  })
}