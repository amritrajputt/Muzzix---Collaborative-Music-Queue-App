import { Server } from "socket.io"
import { Server as HttpServer } from "http"

export const initSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3001"],
    },
  })

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id)

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id)
    })
  })

  return io
}