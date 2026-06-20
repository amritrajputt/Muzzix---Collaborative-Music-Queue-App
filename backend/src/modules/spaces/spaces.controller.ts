import { NextFunction, Request, Response } from "express"
import ApiError from "../../common/errors/ApiError.js"
import ApiResponse from "../../common/responses/ApiResponse.js"
import SpaceService from "./spaces.service.js"

class SpaceController {
    static async createSpace(req: Request, res: Response, next: NextFunction) {
        try {
            const dbUserId = req.dbUser.id;
            const { spaceName, spacePassword } = req.body;
            if (!spaceName || !spacePassword) {
                throw ApiError.badRequest("spaceName and spacePassword are required");
            }

            const space = await SpaceService.createSpace({
                name: spaceName,
                password: spacePassword,
                userId: dbUserId
            })
            const response = ApiResponse.created(201, {
                space: {
                    ...space,
                    rawPassword: spacePassword
                }
            }, "Space created successfully")
            return res.status(response.statusCode).json(response)

        } catch (err) {
            next(err);
        }
    }
    static async joinSpace(req: Request, res: Response, next: NextFunction) {
        try {
            const { spaceId, guestName, spacePassword } = req.body;
            const guestUuid = req.guestUuid!;

            if (!spaceId || !guestName || !spacePassword) {
                throw ApiError.badRequest("spaceId , guestName and spacePassword are required");
            }

            const space = await SpaceService.joinSpace({
                spaceId,
                guestName,
                spacePassword,
                guestUuid
            })
            const response = ApiResponse.created(201, { space }, "Space joined successfully")
            return res.status(response.statusCode).json(response)
        } catch (err) {
            next(err);
        }
    }
    
    static async getSpaceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { spaceId } = req.params;
            if (!spaceId) {
                throw ApiError.badRequest("spaceId is required");
            }
            const space = await SpaceService.getSpaceById(spaceId)
            const response = ApiResponse.created(201, { space }, "Space details fetched successfully")
            return res.status(response.statusCode).json(response)
        } catch (err) {
            next(err);
        }
    }
    static async deleteSpace(req: Request, res: Response, next: NextFunction) {
        try {
            const { spaceId } = req.params;
            if (!spaceId) {
                throw ApiError.badRequest("spaceId is required");
            }
            const space = await SpaceService.deleteSpace(spaceId)
            const response = ApiResponse.created(201, { space }, "Space deleted successfully")
            return res.status(response.statusCode).json(response)
        } catch (err) {
            next(err);
        }
    }
    static async getMySpaces(req: Request, res: Response, next: NextFunction) {
        try {
            const dbUserId = req.dbUser.id;
            const spaces = await SpaceService.getSpacesByUserId(dbUserId)
            const response = ApiResponse.created(201, { spaces }, "Spaces fetched successfully")
            return res.status(response.statusCode).json(response)
        } catch (err) {
            next(err);
        }
    }
}
export default SpaceController