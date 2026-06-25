import "express-async-errors"
import dotenv from "dotenv"
dotenv.config()

import express, { Express } from "express"
import { clerkMiddleware } from "@clerk/express"
import { errorHandler } from "./common/middleware/errorHandler.js"
import authRoutes from "./modules/auth/auth.routes.js"
import spaceRouter from "./modules/spaces/spaces.routes.js"
import songRouter from "./modules/songs/songs.routes.js"
import voteRouter from "./modules/votes/votes.routes.js"

const app: Express = express()

// ─── CORS Middleware ───────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-guest-uuid");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use("/auth/webhook", express.raw({ type: "application/json" }))

// ─── Middleware ──────────────────────────
app.use(express.json())
app.use(clerkMiddleware())

// ─── Routes ──────────────────────────────
app.use("/auth", authRoutes)
app.use("/", spaceRouter)
app.use("/", songRouter)
app.use("/", voteRouter)

// ─── Error Handler — hamesha sabse last ──
app.use(errorHandler)

export default app