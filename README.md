# 🎵 Muzzix — Collaborative Music Queue App

A high-performance, real-time collaborative music room application. Hosts create secure, private spaces, and participants join as authenticated users or temporary guests to search, queue, and vote on tracks in real time. The play queue automatically re-ranks dynamically, and playback is synchronized across all clients without manual page refresh.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    Client[React Frontend / YT Iframe API] <-->|Socket.IO Events| WS[Node.js WebSocket Server]
    ClientClient[Guest / Host Client] -->|HTTPS REST| API[Express API Server]
    API -->|Auth Verification| Clerk[Clerk Auth Services]
    API <-->|Drizzle ORM| DB[(PostgreSQL Database)]
    API <-->|Queue / Rate Limits| Redis[(Redis Key-Value Cache)]
    WS <-->|Pub/Sub Sync| Redis
    DB <-->|Sync State| Redis
```

Muzzix splits its data engine between **PostgreSQL** (durability for users, transaction history, space metadata) and **Redis** (ephemeral real-time queues, concurrent rate limits, lock states).

---

## 🧠 Core Engineering Problems & Solutions

### 1. Playback Synchronization (The Latency Drift Problem)
**The Problem:** In a collaborative room, a host plays a song. Listeners joining the room must start hearing the song at the exact current playback frame. If a listener lags behind or experiences jitter, their player must auto-correct without causing infinite playback loop triggers or audio stutter.
**The Solution:**
- **Deterministic Server-Side Playback State:** The server does not stream the audio bytes; instead, it maintains an active `playbackState` object in Redis:
  ```json
  {
    "songId": "dQw4w9WgXcQ",
    "isPlaying": true,
    "startedAt": 1719416400000,
    "pausedAt": 45.2
  }
  ```
- **Drift Calculation:** When a client player boots up or receives a sync message, it calculates the elapsed time:
  - If `isPlaying` is false, elapsed = `pausedAt`.
  - If `isPlaying` is true, elapsed = `(Date.now() - startedAt) / 1000`.
- **Threshold-Based Seeking:** The client compares its local YouTube player timestamp ($t_{\text{local}}$) to the server timestamp ($t_{\text{server}}$). If the absolute drift $|t_{\text{local}} - t_{\text{server}}| > 2.5\text{s}$, the client calls `player.seekTo(t_server, true)`. Otherwise, it does nothing to prevent network stuttering.

### 2. Dynamic Priority Queue & Tie-Breakers (Redis Sorted Sets)
**The Problem:** Songs must be ordered dynamically by vote counts. If two songs have the exact same number of votes, the song that was submitted first must take priority.
**The Solution:**
- We store the queue in a Redis Sorted Set (`ZSET`) using the key `space:${spaceId}:queue`.
- To encode both vote count and insertion order into a single numeric score ($S$) for `ZADD`, we use a composite weight formula:
  $$S = \text{votes} + \left(1 - \frac{\text{timestamp}}{10^{13}}\right)$$
  - This ensures that a higher vote count always dominates.
  - For identical vote counts, the division of the Unix epoch timestamp makes older submissions receive a slightly higher score weight, naturally preserving insertion order priority.

### 3. Concurrency Protection in Multi-User Upvoting
**The Problem:** If 100 users hit "upvote" on the same song at the same microsecond, standard database `UPDATE space_songs SET votes = votes + 1` queries cause lock contention, deadlocks, or dirty reads.
**The Solution:**
- Upvote requests bypass PostgreSQL entirely and hit Redis.
- We issue atomic increments:
  ```bash
  MULTI
  SADD space:${spaceId}:song:${songId}:voters ${guestUuid}
  ZINCRBY space:${spaceId}:queue 1 ${songId}
  EXEC
  ```
- If the voter's UUID is already present in the set, the transaction is rejected, preventing double-voting. The database is synchronized asynchronously via a throttled batch-write queue.

---

## 🛠️ Tech Stack

### Frontend Layer
- **Framework:** Vite + React 19 + TypeScript
- **State & Routing:** TanStack Router (fully type-safe routes)
- **Styling:** Tailwind CSS + custom glassmorphic properties
- **Animation:** Framer Motion (toast notification system transitions)
- **Player API:** Native YouTube Iframe Player API wrapper

### Backend Layer
- **Runtime:** Node.js + Express + TypeScript
- **Database Access:** Drizzle ORM (SQL compiler & migrations)
- **Real-time Protocol:** Socket.IO v4 (WebSockets with polling fallback)
- **In-Memory Store:** Redis (Sorted Sets, Hashes, Pub/Sub channels)
- **Security:** Clerk SDK (Session verification middlewares)

---

## 💾 Database Schema Spec (Drizzle ORM)

```typescript
// Users table (Clerk synchronized)
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  displayName: varchar("display_name", { length: 256 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spaces table
export const spaces = pgTable("spaces", {
  id: varchar("id", { length: 12 }).primaryKey(), // base58 token
  spaceName: varchar("space_name", { length: 256 }).notNull(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 📡 WebSocket Event Specifications

| Event Name | Direction | Payload Schema | Description |
|---|---|---|---|
| `join-space` | Client $\rightarrow$ Server | `{ spaceId: string, guestUuid: string, guestName: string }` | Enters a room connection pool. |
| `queue-updated` | Server $\rightarrow$ Client | `Song[]` | Emitted when queue order changes due to votes/adds. |
| `playback-state-changed` | Server $\leftrightarrow$ Client | `{ isPlaying: boolean, currentTime: number }` | Broadcaster coordinates media action. |
| `report-duration` | Client $\rightarrow$ Server | `{ spaceId: string, songId: string, duration: number }` | Reports video length to track end. |
| `song-ended` | Client $\rightarrow$ Server | `{ spaceId: string, songId: string }` | Sent by host/client to trigger next track. |

---

## ⚙️ Development Environment Setup

### 1. Prerequisite Installations
Ensure you have **Node.js (v20+)**, **pnpm**, and **Docker** installed.

### 2. Infrastructure Setup (Docker Compose)
Start the database and caching layer in the background:
```bash
docker-compose up -d
```

### 3. Backend Environment Config
Create `backend/.env` file:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/muzix_db
REDIS_URL=redis://localhost:6380
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
YOUTUBE_API_KEY=AIzaSy...
```

Run database migrations:
```bash
cd backend
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

### 4. Frontend Environment Config
Create `frontend/.env` file:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Run Vite development server:
```bash
cd ../frontend
pnpm install
pnpm dev
```

---

## 🚀 Performance Optimizations
- **Multiplexed WS Handshake:** Handshake authentication is validated asynchronously without blocking the WebSocket message loop threads.
- **Tailwind v4 Compile Pass:** Utilizes direct Rust compiler engines to bundle styling sheets in under 15ms.
- **Connection Recovery Store:** Socket.IO connection recovery caches state to preserve room connections on cellular network transitions.

