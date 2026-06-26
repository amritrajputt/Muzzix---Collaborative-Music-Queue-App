import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import { registerSocketEvents } from "./socket.events.js"
import { subscriber, ROOM_EVENTS_CHANNEL } from "../redis/redis.pubsub.js"
export let io: Server | null = null

export const initSocketServer = (httpServer: HttpServer): Server => {
  const ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins to enable local network testing and localtunnels
        callback(null, true);
      },
      credentials: true
    },
  })

  io = ioInstance
  subscribeToRoomEvents(ioInstance)  

  ioInstance.on("connection", (socket) => {
    registerSocketEvents(socket, ioInstance)
  })

  return io
}

export const subscribeToRoomEvents = (io: Server) => {
  subscriber.subscribe(ROOM_EVENTS_CHANNEL, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err)
      return
    }
  })

  subscriber.on("message", (channel, message) => {
    if (channel === ROOM_EVENTS_CHANNEL) {
      try {
        const { spaceId, event, data } = JSON.parse(message)
        io.in(spaceId).emit(event, data)
      } catch (error) {
        console.error("Failed to parse room-events Pub/Sub message:", error)
      }
    }
  })
}