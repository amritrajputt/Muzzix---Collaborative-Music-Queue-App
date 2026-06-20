import { NextFunction, Request, Response } from "express"
import { ClerkWebhookEvent } from "./auth.types.js"
import { Webhook } from "svix"
import AuthService from "./auth.service.js"
import ApiResponse from "../../common/responses/ApiResponse.js"
import ApiError from "../../common/errors/ApiError.js"
import { getAuth } from "@clerk/express"

class AuthController {

    static async registerUserController(req: Request, res: Response, next: NextFunction) {
        try {
            const { email_address, id, first_name, last_name } = req.body
            const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
            if (!email_address || !id || !name) {
                throw ApiError.badRequest("All fields are required")
            }
            await AuthService.registerUser(email_address, name, id)

            const response = ApiResponse.created(201, {}, "User registered successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async getMeController(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = getAuth(req)
            if (!userId) {
                throw ApiError.unauthorized("User not found")
            }
            const user = await AuthService.getMe(userId)
            const response = ApiResponse.success(200, user, "User fetched successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async updateUserController(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email_address } = req.body
            const { userId } = getAuth(req)
            if (!userId) {
                throw ApiError.unauthorized("User not found")
            }
            await AuthService.updateUser(email_address, name, userId)
            const response = ApiResponse.success(200, {}, "User updated successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async deleteUserController(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = getAuth(req)
            if (!userId) {
                throw ApiError.unauthorized("User not found")
            }
            await AuthService.deleteUser(userId)
            const response = ApiResponse.success(200, {}, "User deleted successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }


    // webhook event controller
    static async handleIncomingWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const svix_id = req.headers["svix-id"] as string
            const svix_timestamp = req.headers["svix-timestamp"] as string
            const svix_signature = req.headers["svix-signature"] as string

            const result = await AuthService.processWebhookEvent(
                req.body,
                svix_id,
                svix_timestamp,
                svix_signature
            )

            const response = ApiResponse.success(200, {}, "Webhook processed successfully")
            return res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

}

export default AuthController