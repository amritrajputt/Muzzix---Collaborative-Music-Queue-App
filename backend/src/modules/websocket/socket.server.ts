import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import { registerSocketEvents } from "./socket.events.js"

export let io: Server | null = null

export const initSocketServer = (httpServer: HttpServer): Server => {
  const ioInstance = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3001"],
    },
  })

  io = ioInstance

  ioInstance.on("connection", (socket) => {
    registerSocketEvents(socket, ioInstance)
  })

  return io
}

export const emitToRoom = (eventName: string, data: any, spaceId: string) => {
  if (io) {
    io.in(spaceId).emit(eventName, data)
  }
}