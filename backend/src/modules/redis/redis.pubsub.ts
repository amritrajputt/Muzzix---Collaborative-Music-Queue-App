import Redis from "ioredis"

export const ROOM_EVENTS_CHANNEL = "room-events"

export const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6380")
export const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6380")

publisher.on("error", (err) => {
  console.error("Redis Publisher Error", err)
})

subscriber.on("error", (err) => {
  console.error("Redis Subscriber Error", err)
})

export const publishToRoom = async (spaceId: string, event: string, data: any) => {
  await publisher.publish(ROOM_EVENTS_CHANNEL, JSON.stringify({ spaceId, event, data }))
}

export const emitToRoom = (eventName: string, data: any, spaceId: string) => {
  publishToRoom(spaceId, eventName, data)
}