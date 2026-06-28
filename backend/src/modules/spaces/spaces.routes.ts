import { Router } from "express"
import { auth } from "../../common/middleware/auth.middleware.js"
import { idempotency } from "../../common/middleware/idempotency.middleware.js"
import SpaceController from "./spaces.controller.js"
const spaceRouter = Router()

spaceRouter.post("/spaces", auth, idempotency, SpaceController.createSpace);
spaceRouter.post("/spaces/join", SpaceController.joinSpace);
spaceRouter.get("/spaces/me", auth, SpaceController.getMySpaces);
spaceRouter.get("/spaces/:spaceId", SpaceController.getSpaceDetails);
spaceRouter.delete("/spaces/:spaceId", auth, SpaceController.deleteSpace);
export default spaceRouter                                              