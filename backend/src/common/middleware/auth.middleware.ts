import { getAuth, clerkClient } from '@clerk/express'
import { Request, Response, NextFunction } from 'express'
import db from '../../db/index.js'
import { users } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = getAuth(req)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  let dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  
  if (dbUser.length === 0) {
    try {
      // Auto-register the user if not found in the DB (e.g. if webhook wasn't received/configured locally)
      const user = await clerkClient.users.getUser(userId)
      const email = user.emailAddresses?.[0]?.emailAddress ?? ""
      const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User"
      
      await db.insert(users).values({
        email,
        name,
        clerkId: userId,
        spaceCount: 0
      })
      
      dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
    } catch (error) {
      console.error("Auto-registration failed:", error)
      res.status(404).json({ error: 'User not registered in database and auto-registration failed' })
      return
    }
  }

  req.dbUser = dbUser[0] 
  next()
}