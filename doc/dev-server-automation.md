# Dev Server Automation

## Purpose
Eliminate the friction of starting two separate terminals (Vite frontend + Express backend) for every Playwright validation session. A single command runs everything.

## Prerequisites
- [Docker](https://docs.docker.com/engine/install/) (recommended)
- OR Node.js 22+ and npm (fallback)

## Quick Start (Docker — Recommended)
```bash
docker-compose up --build -d
```
This single command:
1. Builds the Vite frontend (`npm run build`)
2. Packages the Express backend + built frontend into a container
3. Starts the server on **port 4000**

The Express server serves both:
- The API at `http://localhost:4000/api/v1/...`
- The frontend SPA at `http://localhost:4000/`
- API docs at `http://localhost:4000/api-docs`

### Stop the container
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

## Fallback (without Docker)
If Docker is not available, use npm:
```bash
npm run dev
```
This starts both the Vite dev server (port **5173**) and Express API (port **4000**) via `concurrently`.
Vite proxies `/api` requests to the Express backend automatically.

## Architecture
```
User's browser
       │
       ▼
  ┌─────────────┐     /api/v1/*     ┌─────────────┐
  │   Express    │ ─────────────────→│  API Routes  │
  │   (port 4000)│                  └─────────────┘
  │              │
  │  Serve static│ ←── dist/ (built Vite frontend)
  └─────────────┘
```

## Why Docker?
| Before | After |
|--------|-------|
| Two terminals: `npx vite` + `npm run start` | One command: `docker-compose up --build -d` |
| ~2 min setup time | ~10s (once image is built) |
| Background processes time out silently | Container stays up reliably |
| Manual terminal management | Single process lifecycle |

## For AI Agents
When performing Playwright validation:
1. Ask the user: **"Please run `docker-compose up --build -d` to start the server."**
2. Wait for confirmation the container is running.
3. Navigate to `http://localhost:4000` for Playwright interactions.
4. When done: **"Please run `docker-compose down` to stop the container."**
