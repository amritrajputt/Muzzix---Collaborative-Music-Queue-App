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

Muzzix splits its data engine between **PostgreSQL** (durability for users, plan limits, spaces metadata, and members) and **Redis** (ephemeral real-time queues, concurrent rate limits, active playback states, and pub/sub room synchronizations).

---

## 🧠 Core Engineering Challenges & Solutions

### 1. Latency-Compensated Playback Synchronization (The Clock Skew Problem)
**The Problem:** In a collaborative room, a host plays a song. Listeners must start hearing the track at the exact same play frame. If a client's system clock is out of sync with the server's clock, calculating the elapsed progress dynamically leads to timing drift, resulting in audio skips or desynchronization.
**The Solution:**
- **Deterministic Server-Side Playback State:** The server maintains an active playback state hash in Redis:
  ```json
  {
    "songId": "dQw4w9WgXcQ",
    "isPlaying": true,
    "startedAt": 1719416400000,
    "pausedAt": 45.2
  }
  ```
- **Precision RTT Synchronization:** Upon establishing a WebSocket connection, the client initiates a handshake to calculate the clock offset ($O$) relative to the server:
  $$\text{RTT} = t_{\text{receive}} - t_{\text{send}}$$
  $$\text{Offset} = t_{\text{server}} - \left(t_{\text{receive}} - \frac{\text{RTT}}{2}\right)$$
- **Elapsed Time Correction:** When rendering the track progress, the client adjusts its local clock skew:
  - If `isPlaying` is false, elapsed = `pausedAt`.
  - If `isPlaying` is true, elapsed = $\frac{(\text{Date.now()} + \text{Offset}) - \text{startedAt}}{1000}$.
- **Threshold-Based Seeking:** The client compares the local player timestamp ($t_{\text{local}}$) to the server timestamp ($t_{\text{server}}$). If the absolute drift $|t_{\text{local}} - t_{\text{server}}| > 2.5\text{s}$, the client triggers `player.seekTo(t_server, true)`. Otherwise, it suppresses seeking to prevent network audio stutter.

### 2. Dynamic Priority Queue & Tie-Breakers (Redis Sorted Sets)
**The Problem:** Songs must be ordered dynamically by vote counts. If two songs have the exact same number of votes, the song that was submitted first must take priority.
**The Solution:**
- We store the queue in a Redis Sorted Set (`ZSET`) using the key `space:${spaceId}:queue`.
- To encode both vote count and insertion order into a single numeric score ($S$) for `ZADD`, we use a composite weight formula:
  $$S = \text{votes} + \left(1 - \frac{\text{timestamp}}{10^{13}}\right)$$
  - This ensures that a higher vote count always dominates.
  - For identical vote counts, the division of the Unix epoch timestamp makes older submissions receive a slightly higher score weight, naturally preserving insertion order priority.

### 3. Concurrency Protection in Multi-User Upvoting
**The Problem:** If 100 users hit "upvote" on the same song at the same microsecond, standard database write queries cause lock contention, deadlocks, or dirty reads.
**The Solution:**
- Upvote requests bypass PostgreSQL entirely and hit Redis.
- We issue atomic transactions:
  ```bash
  MULTI
  SADD space:${spaceId}:song:${songId}:voters ${guestUuid}
  ZINCRBY space:${spaceId}:queue 1 ${songId}
  EXEC
  ```
- If the voter's UUID is already present in the set, the transaction is rejected, preventing double-voting. The database is synchronized asynchronously via a throttled batch-write queue.

### 4. Interactive Browser Autoplay Recovery
**The Problem:** Modern browsers enforce strict autoplay policies that block media playback on page load/refresh unless the user has first interacted with the document.
**The Solution:**
- **Autoplay State Detection:** If the server state is active (`isPlaying: true`) but the iframe player transitions to `PAUSED` immediately on page load, the app detects an autoplay block.
- **Glass Play Shield:** The app renders a blurred glass overlay stating "Click to Sync Audio" over the player and registers document-wide `click` and `keydown` event listeners.
- **Immediate Playback Recovery:** The moment the user clicks anywhere on the document, the listeners capture the interaction, call `player.playVideo()`, sync the play frame, and remove the global event listeners.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + Radix UI (Shadcn UI)
- **Routing & State:** TanStack Router + React Context API
- **Backend:** Node.js + Express + TypeScript
- **Database Access:** PostgreSQL + Drizzle ORM (SQL Schema compilations & migrations)
- **In-Memory Store:** Redis v7 (Sorted Sets, Sets, Hashes, Pub/Sub channels)
- **Real-time Protocol:** Socket.IO v4 (WebSockets with polling fallback)
- **Authentication:** Clerk Express SDK (JWT authentication middleware)

---

## 📂 Project Structure

```
backend/
  src/
    modules/
      auth/        → User session controls, Clerk API profiles
      spaces/      → Music room creation, joining, and configuration
      songs/       → Search, queue additions, metadata fetching
      votes/       → Upvote/downvote operations
      websocket/   → Socket.IO event registrations and room handlers
      redis/       → Redis connection pooling, pub/sub, sorted sets
    db/
      schema.ts    → Drizzle ORM database definitions
      migrations/  → Generated SQL schemas
    common/
      middleware/  → Auth checks, error capture, guest resolution
      errors/      → Custom ApiError hierarchies
    app.ts         → Express configurations & CORS definitions
    index.ts       → Server initialization & Socket.IO mounting

frontend/
  src/
    pages/         → LandingPage, DashboardPage, SpacePage
    components/    → LeaderBoard, RoomInfoSidebar, QueueSubmissionForm, QueueList, MusicPlayerCard
    hooks/         → useSpaceSocket
    services/      → API services (api, songService, createRoomService, joinRoomService)
```

---



## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js (v20+)**
- **pnpm**
- **Docker Desktop**
- **Clerk Account** (for authentication keys)

### 2. Infrastructure Setup (Docker Compose)
Start the database and caching layer in the background:
```bash
docker-compose up -d
```

### 3. Backend Environment Config
Create a `backend/.env` file:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/muzix_db
REDIS_URL=redis://localhost:6380
CLERK_SECRET_KEY=sk_test_...
YOUTUBE_API_KEY=AIzaSy...
```

Run database migrations and start the backend:
```bash
cd backend
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

### 4. Frontend Environment Config
Create a `frontend/.env` file:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:3000
```

Start the Vite development server:
```bash
cd ../frontend
pnpm install
pnpm dev
```

---

## 📄 License

MIT
