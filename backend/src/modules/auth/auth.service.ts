import db from "../../db/index.js"
import ApiError from "../../common/errors/ApiError.js"
import { users } from "../../db/schema.js"
import { eq } from "drizzle-orm"
import { Webhook } from "svix"
import { ClerkWebhookEvent } from "./auth.types.js"
class AuthService {
    static async registerUser(email_address: string, name: string, clerkId: string) {
        const result = await db.select().from(users).where(eq(users.clerkId, clerkId))

        if (result.length > 0) {
            throw ApiError.badRequest("User already exists")
        }

        await db.insert(users).values({
            email: email_address,
            name,
            clerkId,
            spaceCount: 0
        })
    }

    static async getMe(clerkId: string) {
        const result = await db.select().from(users).where(eq(users.clerkId, clerkId))

        if (result.length === 0) {
            throw ApiError.badRequest("User not found")
        }

        return result[0]
    }

    static async updateUser(email_address: string, name: string, clerkId: string) {
        const result = await db.select().from(users).where(eq(users.clerkId, clerkId))

        if (result.length === 0) {
            throw ApiError.badRequest("User not found")
        }

        await db.update(users).set({
            name,
            email: email_address
        }).where(eq(users.clerkId, clerkId))
    }

    static async deleteUser(clerkId: string) {
        const result = await db.select().from(users).where(eq(users.clerkId, clerkId))

        if (result.length === 0) {
            throw ApiError.badRequest("User not found")
        }

        await db.delete(users).where(eq(users.clerkId, clerkId))
    }
    static async processWebhookEvent(body: any, svix_id: string, svix_timestamp: string, svix_signature: string) {
        if (!svix_id || !svix_timestamp || !svix_signature) {
            throw ApiError.badRequest("Missing svix headers")
        }
        const wh = new Webhook(process.env.WEBHOOK_SIGNING_SECRET!)
        let event: ClerkWebhookEvent
        try {
            event = wh.verify(body.toString(), {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as ClerkWebhookEvent
        }
        catch (error) {
            throw ApiError.badRequest("Invalid webhook signature")
        }
        const eventType = event.type
        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name } = event.data
            const email = email_addresses?.[0]?.email_address ?? ""
            const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
            await this.registerUser(email, name, id)
        }
        else if (eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name } = event.data
            const email = email_addresses?.[0]?.email_address ?? ""
            const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
            await this.updateUser(email, name, id)
        }
        else if (eventType === "user.deleted") {
            const { id } = event.data
            await this.deleteUser(id)
        }

        return true;
    }
}

export default AuthService