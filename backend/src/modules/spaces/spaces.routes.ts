import Router from "express"
import { requireAuth } from "@clerk/express"
import SpaceController from "./spaces.controller.js"
const spaceRouter = Router()


spaceRouter.post("/spaces",requireAuth(),SpaceController.createSpace);
spaceRouter.post("/spaces/join",requireAuth(),SpaceController.joinSpace);
spaceRouter.get("/spaces/:id",requireAuth(),SpaceController.getSpaceDetails);
spaceRouter.get("/delete",requireAuth(),SpaceController.deleteSpace);
spaceRouter.get("/spaces/me",requireAuth(),SpaceController.getMySpaces);
export default spaceRouter