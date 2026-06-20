import { clerkMiddleware, getAuth } from '@clerk/express'
import { Request, Response, NextFunction } from 'express'

export const clerkAuth = clerkMiddleware()

export const auth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = getAuth(req)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}