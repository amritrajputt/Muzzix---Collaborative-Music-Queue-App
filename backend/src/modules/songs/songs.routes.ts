import Router from "express";
import { songController } from "./songs.controller.js";
import { getGuestIdentifier } from "../../common/middleware/guest.middleware.js";
import { idempotency } from "../../common/middleware/idempotency.middleware.js";
const songRouter = Router();

songRouter.post("/add", getGuestIdentifier, idempotency, songController.addSongController)
songRouter.get('/:spaceId/songs', songController.getSpaceSongsController)

export default songRouter