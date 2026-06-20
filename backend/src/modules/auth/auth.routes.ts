import { Router } from "express";
import {auth} from "../../common/middleware/auth.middleware.js"
import AuthController from "./auth.controller.js";


const router:Router = Router()

router.post("/webhook", AuthController.handleIncomingWebhook);

router.post("/register", AuthController.registerUserController);

router.get("/me", auth, AuthController.getMeController);

router.patch("/updateMyInfo", auth, AuthController.updateUserController);

router.delete("/deleteMyInfo", auth, AuthController.deleteUserController);

export default router


