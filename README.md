# 🎵 Muzzix — Collaborative Music Queue App

Muzzix is a real-time collaborative music room app where a host creates a private space, shares the Room ID and password, and everyone inside can search for songs, add them to a shared queue, and vote on what plays next. The queue automatically reorders based on votes, and every participant sees updates instantly — no refresh needed.

---

## ✨ Features

- 🔐 **Creator authentication** via Clerk — secure sign up and login, no password handling on our end
- 👥 **Guest access** — members join with just a Room ID, guest name, and password, no account required
- 🔍 **Song search** powered by the YouTube Data API
- 🗳️ **Real-time voting** — upvote or downvote songs, queue reorders live for everyone
- 🚫 **Abuse protection** — queue size limits and per-user rate limiting prevent spam
- 📡 **Live sync** across all connected users via WebSockets
- 💎 **Free & Pro plans** — limits on room count and queue size

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS + Shadcn UI |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Cache / Real-time store | Redis |
| Real-time transport | Socket.IO (WebSockets) |
| Auth | Clerk |
| Containerization | Docker (PostgreSQL + Redis) |

---

## 🧠 Architecture Highlights

**Modular backend** — every feature (auth, spaces, songs, votes, websocket, redis) lives in its own self-contained module with its own routes, controller, service, and types, keeping the codebase easy to navigate and extend.

**Hybrid storage strategy** — permanent data (users, rooms, play history) lives in PostgreSQL, while fast-changing real-time data (live vote counts, song queue order, rate limits) lives in Redis using Sorted Sets and Hashes for instant reads and writes.

**Atomic vote counting** — votes are updated using Redis's atomic operations, preventing race conditions when multiple users vote on the same song simultaneously.

**Multi-server ready** — Redis Pub/Sub keeps WebSocket events in sync across multiple backend server instances, so the app can scale horizontally without users missing real-time updates.

**Secure room access** — room passwords are hashed before storage and never returned in API responses after creation; guest identity for rate limiting is tracked per session.

---

## 📂 Project Structure

```
backend/
  src/
    modules/
      auth/        → user registration, profile, Clerk webhook sync
      spaces/       → create, join, delete music rooms
      songs/        → search and queue management
      votes/         → upvote / downvote logic
      websocket/      → Socket.IO server and event handlers
      redis/           → Redis client, pub/sub, sorted sets
    db/
      schema.ts         → Drizzle ORM schema
      migrations/
    common/
      middleware/         → auth guard, error handler
      errors/
    config/
    app.ts
    index.ts

frontend/
  src/
    pages/        → Landing, Dashboard, Join, Room, Upgrade
    components/    → Queue card, Vote button, Search, Now Playing
    hooks/          → useSocket, useRoom, useQueue
    services/        → API calls
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Docker Desktop
- A Clerk account (for authentication)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/muzix.git
cd muzix

# Start PostgreSQL and Redis
docker-compose up -d

# Install backend dependencies
cd backend
pnpm install

# Set up environment variables
cp .env.example .env
# fill in DATABASE_URL, REDIS_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET

# Run migrations
pnpm db:generate
pnpm db:migrate

# Start the backend
pnpm dev
```

```bash
# In a separate terminal — frontend
cd frontend
pnpm install
pnpm dev
```

---

## 🗺️ Roadmap

- [ ] Stripe integration for Pro plan upgrades
- [ ] Skip-song voting
- [ ] Room chat
- [ ] Mobile app

---

## 📄 License

MIT
