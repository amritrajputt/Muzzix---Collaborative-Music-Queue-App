import { getAuth } from '@clerk/express'
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

    const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (dbUser.length === 0) {
    res.status(404).json({ error: 'User not registered in database' })
    return
  }
  req.dbUser = dbUser[0] 

  next()
}