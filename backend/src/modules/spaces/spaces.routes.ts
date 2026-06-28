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
spaceRouter.post("/spaces/:spaceId/next", auth, idempotency, SpaceController.skipSong);
spaceRouter.post("/spaces/:spaceId/playback", auth, SpaceController.controlPlayback);
export default spaceRouter                                              