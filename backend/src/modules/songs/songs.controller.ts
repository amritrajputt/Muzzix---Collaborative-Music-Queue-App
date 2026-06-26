import { Request, Response, NextFunction } from "express"
import { getAuth } from "@clerk/express"
import ApiResponse from "../../common/responses/ApiResponse.js"
import ApiError from "../../common/errors/ApiError.js"
import songService from "./songs.service.js"

class songController {
    static async addSongController(req: Request, res: Response, next: NextFunction) {
        try {
            const { spaceId, youtubeURL } = req.body
            const guestUuid = req.guestUuid!

            if (!youtubeURL) {
                throw ApiError.badRequest("youtubeURL is required")
            }
            if (!spaceId) {
                throw ApiError.badRequest("spaceId is required")
            }

            let clerkUserId: string | null = null
            try {
                const { userId } = getAuth(req)
                clerkUserId = userId || null
            } catch (err) {
                // Ignore auth error for unauthenticated guests
            }

            const song = await songService.addSong(spaceId, guestUuid, youtubeURL, clerkUserId)
            const response = ApiResponse.created(201, song, "Song added successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async getSpaceSongsController(req: Request, res: Response, next: NextFunction) {
        try {
            const {spaceId} = req.params
            if (!spaceId) {
                throw ApiError.badRequest("spaceId is required")
            }
            const songs = await songService.getSpaceSongs(spaceId)
            const response = ApiResponse.success(200, {songs}, "Songs fetched successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

}
export { songController }