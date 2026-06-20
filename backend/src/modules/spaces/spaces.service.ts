import db from "../../db/index.js"
import ApiError from "../../common/errors/ApiError.js"
import { users,plans,spaces,spaceMembers } from "../../db/schema.js"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcrypt";

interface CreateSpace{
    name:string,
    password:string,
    userId:string
}
interface JoinSpace{
    spaceId:string,
    guestName:string,
    spacePassword:string,
    guestUuid:string
}

class SpaceService{
    static async createSpace({name,password,userId}:CreateSpace){
        const userPlan = await db.select().from(plans).where(eq(plans.userId,userId))
        const planType = userPlan[0]?.planType ?? 'free';
        if (planType === 'free') {
            const existingSpaces = await db.select().from(spaces).where(eq(spaces.userId, userId))
            if (existingSpaces.length >= 3) {
                throw ApiError.badRequest("Free plan users can only have 3 spaces");
            }
        }
        const hashPassword=await bcrypt.hash(password,10);
        const newSpace = await db.insert(spaces).values({
            spaceName:name,
            spacePassword:hashPassword,
            userId
        }).returning();
        return newSpace[0];
    }

    static async joinSpace({spaceId,guestName,spacePassword,guestUuid}:JoinSpace){ 
        const space = await db.select().from(spaces).where(eq(spaces.id, spaceId)).limit(1);
        if (space.length === 0) {
            throw ApiError.notFound("Space not found");
        }
        if (!space[0].isActive) {
            throw ApiError.badRequest("Space is not active");
        }
        const isPasswordValid = await bcrypt.compare(spacePassword, space[0].spacePassword);
        if (!isPasswordValid) {
            throw ApiError.badRequest("Invalid password");
        }

        const existingMember = await db.select().from(spaceMembers)
            .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.guestUuid, guestUuid)))
            .limit(1);

        if (existingMember.length > 0) {
            // Update name if they changed it
            if (existingMember[0].guestName !== guestName) {
                const updated = await db.update(spaceMembers)
                    .set({ guestName })
                    .where(eq(spaceMembers.id, existingMember[0].id))
                    .returning();
                return updated[0];
            }
            return existingMember[0];
        }

        const newMember = await db.insert(spaceMembers).values({
            spaceId,
            guestName,
            guestUuid
        }).returning();
        return newMember[0]; 
    }

    static async getSpaceById(spaceId:string){
        const space = await db.select().from(spaces).where(eq(spaces.id, spaceId)).limit(1);
        if (space.length === 0) {
            throw ApiError.notFound("Space not found");
        }
        return space[0];
    }

    static async deleteSpace(spaceId:string){
        const space = await db.delete(spaces).where(eq(spaces.id, spaceId)).returning();
        if (space.length === 0) {
            throw ApiError.notFound("Space not found");
        }
        return space[0];
    }

    static async getSpacesByUserId(userId:string){
        const space = await db.select().from(spaces).where(eq(spaces.userId, userId));
        if (space.length === 0) {
            throw ApiError.notFound("Space not found");
        }
        return space;
    }

}
export default SpaceService