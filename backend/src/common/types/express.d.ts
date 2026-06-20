import { users } from '../../db/schema.js'

type DbUser = typeof users.$inferSelect

declare global {
  namespace Express {
    interface Request {
      dbUser: DbUser
      guestUuid?: string
    }
  }
}
