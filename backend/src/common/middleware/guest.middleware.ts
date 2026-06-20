import { Request, Response, NextFunction } from "express"
import ApiError from "../errors/ApiError.js"

export const getGuestIdentifier = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const guestUuid = req.headers["x-guest-uuid"] as string

  if (!guestUuid) {
    throw ApiError.badRequest("x-guest-uuid header is required")
  }

  req.guestUuid = guestUuid
  next()
}
