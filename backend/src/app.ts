import "express-async-errors"
import dotenv from "dotenv"
dotenv.config()

import express, { Express } from "express"
import { clerkMiddleware } from "@clerk/express"
import { errorHandler } from "./common/middleware/errorHandler.js"
import authRoutes from "./modules/auth/auth.routes.js"

const app: Express = express()
app.use("/auth/webhook", express.raw({ type: "application/json" }))

// ─── Middleware ──────────────────────────
app.use(express.json())
app.use(clerkMiddleware())

// ─── Routes ──────────────────────────────
app.use("/auth", authRoutes)

// ─── Error Handler — hamesha sabse last ──
app.use(errorHandler)

export default app