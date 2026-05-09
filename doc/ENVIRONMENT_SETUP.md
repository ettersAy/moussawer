# Environment Setup — Local Dev & Free Production Hosting

This project uses a single Neon PostgreSQL database shared between local
development and production hosting. Both environments connect to the same
database — the difference is how the app runs.

## Architecture

```
                      ┌──────────────────────┐
                      │   Neon (free)          │
                      │   PostgreSQL            │
                      │   0.5 GB, permanent     │
                      └──────────┬─────────────┘
                                 │ DATABASE_URL + DIRECT_URL
                 ┌───────────────┴───────────────┐
                 │                               │
     ┌───────────▼──────────┐      ┌─────────────▼──────────┐
     │  Local dev            │      │  Render.com (free)      │
     │  npm run dev          │      │  node dist-server/...   │
     │  tsx + vite (hot)     │      │  built frontend served  │
     │  localhost:5173       │      │  moussawer.onrender.com │
     └───────────────────────┘      └────────────────────────┘
```

| Env | Database | Server | Frontend | Dev reload |
|---|---|---|---|---|
| **Local** | Neon cloud (same DB) | `tsx watch` on port 4000 | Vite dev on port 5173 | Hot (HMR) |
| **Production** | Neon cloud (same DB) | Compiled JS on port 4000 | Built static files (served by Express) | None (build once) |

> **Why no local database?** SQLite is NOT compatible with the Prisma schema
> (`provider = "postgresql"`). Installing a local PostgreSQL is unnecessary when
> Neon offers a free 0.5 GB cloud database. You develop directly against the
> same database used in production — no schema drift, no local/cloud sync.

---

## Step 1: Prerequisites

- **Node.js** 22+ and **npm** 10+
- A **GitHub account** (for Render.com deployment)
- A **Neon account** (free, no credit card)
- A **Render.com account** (free, no credit card)

No local database needed. No Docker needed for development.

---

## Step 2: Create the Neon Database (once)

This is the shared database for both environments. Do this once.

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub login works).
2. Click **"Create project"**.
3. Fill in:
   - **Name:** `moussawer`
   - **Region:** Pick the closest to you (e.g., `US East`).
   - **Postgres version:** 16 (default)
4. Wait ~30 seconds for provisioning.
5. Go to **Dashboard → your project → Connection Details**.
6. Copy **both** connection strings:
   - **Pooled connection** (has `-pooler` in hostname) — use for `DATABASE_URL`
   - **Direct connection** (no `-pooler`) — use for `DIRECT_URL`
7. Append `?sslmode=require&pgbouncer=true` to the pooled URL:
   ```
   postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require&pgbouncer=true
   ```
   Append `?sslmode=require` to the direct URL:
   ```
   postgresql://<user>:<password>@<host>.<region>.aws.neon.tech/<db>?sslmode=require
   ```
   > **Why two URLs?** Neon uses PgBouncer for connection pooling. The pooled
   > endpoint (`DATABASE_URL`) handles queries. The direct endpoint
   > (`DIRECT_URL`) is needed for Prisma migrations and schema operations.

---

## Step 3: Generate a JWT Secret

```bash
openssl rand -hex 32
```

Copy the output. You will use this for `JWT_SECRET` in both environments.

---

## Step 4: Local Development Setup

### 4.1 Install dependencies

```bash
cd moussawer
npm install
```

### 4.2 Create `.env`

```bash
cp .env.example .env
```

Edit `.env` with your real values:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<host>.<region>.aws.neon.tech/<db>?sslmode=require"
JWT_SECRET="<output-from-step-3>"
PORT=4000
VITE_API_URL="/api/v1"
```

> `.env` is in `.gitignore` — it will never be committed. Never put real
> credentials in `.env.example`.

### 4.3 Push the database schema

```bash
npx prisma db push && npx prisma generate
```

### 4.4 Seed the database

```bash
npm run db:seed
```

This creates the test accounts:
| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password` |
| Photographer | `photographer-one@example.com` | `password` |
| Client | `client@example.com` | `password` |

### 4.5 Start the dev server

```bash
npm run dev
```

This starts two processes:
- **API server** on `http://localhost:4000` (swagger at `/api-docs`)
- **Vite dev server** on `http://localhost:5173` (with hot reload)

The Vite server proxies `/api/v1` requests to the API server automatically.

### 4.6 Verify it works

```bash
curl http://localhost:4000/api/v1/health
# → {"status":"ok"}

curl http://localhost:5173
# → Returns the frontend HTML
```

---

## Step 5: Production Hosting (Render.com, free)

### 5.1 Verify the Prisma schema is PostgreSQL

Check `prisma/schema.prisma` — the datasource block must say:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 5.2 Verify build and start scripts

In `package.json`, these must exist:

```json
"build": "tsc --noEmit && vite build && tsc -p tsconfig.server.json && echo '{\"type\":\"commonjs\"}' > dist-server/package.json",
"start": "node dist-server/server/index.js"
```

> **What the build does:**
> 1. `tsc --noEmit` — TypeScript type check
> 2. `vite build` — frontend bundle to `dist/`
> 3. `tsc -p tsconfig.server.json` — server TypeScript compiled to `dist-server/`
> 4. Writes `{"type":"commonjs"}` so Node.js runs the compiled server as CommonJS
>    (the root `package.json` has `"type": "module"` which would break the
>    compiled output otherwise)

### 5.3 Deploy on Render.com

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **"New +" → "Web Service"**.
3. Connect your GitHub repository (`ettersAy/moussawer`).
4. Configure:
   - **Name:** `moussawer`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build && npx prisma generate`
   - **Start Command:** `node dist-server/server/index.js`
   - **Plan:** **Free**
5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon pooled URL from Step 2 |
   | `DIRECT_URL` | Your Neon direct URL from Step 2 |
   | `JWT_SECRET` | Your secret from Step 3 |
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |

6. Click **"Deploy Web Service"**.

The first deploy takes ~3-5 minutes. Run `npm run db:push` and `npm run db:seed`
locally before or after the first deploy — since both environments share the same
Neon database, the data will be available to production immediately.

### 5.4 Access the app

Your app is live at: `https://moussawer.onrender.com`

- **Web app:** `https://moussawer.onrender.com`
- **API:** `https://moussawer.onrender.com/api/v1`
- **Swagger docs:** `https://moussawer.onrender.com/api-docs`
- **Health check:** `https://moussawer.onrender.com/api/v1/health`

---

## Step 6: Daily Workflow

### Local development

```bash
# Start the dev server (API + Vite, hot reload)
npm run dev

# Make changes — Vite auto-reloads the frontend, tsx auto-reloads the server
```

### Schema changes

When you modify `prisma/schema.prisma`:

```bash
# Push schema changes to the Neon database
npx prisma db push

# Regenerate the Prisma client (required after schema changes)
npx prisma generate

# If you added seed data changes:
npm run db:seed
```

### Deploy changes to production

```bash
git add .
git commit -m "feat: describe your changes"
git push origin main
```

Render.com auto-deploys on every push to `main`. No manual deployment needed.

### Checking production logs

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click your `moussawer` service
3. Click **"Logs"** tab

---

## FAQ

### Why no local PostgreSQL?

Neon free tier gives you 0.5 GB permanently. Developing against the same
database as production eliminates:
- Schema drift (local SQLite vs production PostgreSQL)
- Connection string switching
- Local database installation/setup
- Docker overhead

### Render free tier limitations

- **Sleeps after 15 minutes of inactivity** — first request takes ~30s to wake
- **750 hours/month** — enough for one service 24/7
- **No custom domain** on free tier
- **No shell access** — all ops must be in the build/start commands

### Keep Render from sleeping (optional)

Use [UptimeRobot](https://uptimerobot.com) (free) to ping
`https://moussawer.onrender.com/api/v1/health` every 10 minutes.

### Neon free tier limitations

- **0.5 GB database storage**
- **~190 compute hours/month** (free tier)
- **No automated backups** on free tier

### "Can't connect to database" on local

- Check your `.env` has both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
- Verify the Neon project is active
- Check `?sslmode=require&pgbouncer=true` is appended to the pooled URL
- Ensure the direct URL does NOT have `-pooler` or `pgbouncer=true`

### "Prisma schema engine failed"

This happens if the `provider` in `prisma/schema.prisma` doesn't match the
actual database. Make sure it's `provider = "postgresql"`.

### .env contains secrets. Is it tracked by git?

No. `.env` is in `.gitignore`. `.env.example` is the tracked template with
placeholder values. Never commit your real `.env`.

---

## Environment Variables Reference

| Variable | Local | Production | Notes |
|---|---|---|---|
| `DATABASE_URL` | Neon pooled URL | Neon pooled URL (set in Render dashboard) | With `-pooler` and `pgbouncer=true` |
| `DIRECT_URL` | Neon direct URL | Neon direct URL (set in Render dashboard) | Without `-pooler`, without `pgbouncer` |
| `JWT_SECRET` | From `openssl rand -hex 32` | Same value (set in Render dashboard) | Must be identical in both envs |
| `PORT` | 4000 | 4000 | Render sets this automatically |
| `VITE_API_URL` | /api/v1 | /api/v1 | Relative path, Vite proxies locally |
| `NODE_ENV` | (not set) | production | Render sets this |

---

## Scripts Reference

| Script | What it does | Used in |
|---|---|---|
| `npm run dev` | Start API (tsx watch) + Vite dev (hot reload) | Local only |
| `npm run build` | Type check + Vite build + server TypeScript compile | Production only |
| `npm start` | Run compiled server JS | Production only |
| `npm run db:push` | Push Prisma schema to database | Both (manually locally, auto on Render) |
| `npm run db:seed` | Insert test data | Both (manually locally, once) |
| `npm run db:generate` | Regenerate Prisma client | After schema changes |
| `npm run db:reset` | db:push + db:seed | Fresh database reset |
| `npm run lint` | ESLint check | Before commits |
| `npm test` | Run test suite | Before commits |

---

## Cost

| Service | Cost | What |
|---|---|---|
| Neon | **$0/month** | 0.5 GB PostgreSQL, permanent |
| Render.com | **$0/month** | 750 hours/month, 512 MB RAM |
| **Total** | **$0/month** | Full app, no credit card needed |
