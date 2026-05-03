# Free Hosting Guide — Moussawer

This guide explains how to host Moussawer **for free** with a **permanent database**.

## Architecture

```
Users → Render.com (Node.js app) → Supabase (PostgreSQL database)
```

| Service | What it does | Free tier limits |
|---|---|---|
| **Supabase** | PostgreSQL database (permanent, cloud-hosted) | 500 MB storage, no credit card required |
| **Render.com** | Hosts the Node.js Express app + serves built frontend | 750 hours/month, sleeps after 15 min inactivity |

> **Why not SQLite?** SQLite is a local file — it gets deleted when the container restarts. Supabase gives you a real PostgreSQL database that persists forever.

---

## Step 1: Create a Supabase Database (Free)

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login works).
2. Click **"New project"**.
3. Fill in:
   - **Name:** `moussawer`
   - **Database Password:** Generate a strong password (save it somewhere)
     > **⚠️ URL-encode special characters:** If your password contains `@`, `:`, `/`, `%`, or `#`, you must URL-encode them in the connection string:
     > - `@` → `%40`
     > - `:` → `%3A`
     > - `/` → `%2F`
     > - `%` → `%25`
     > - `#` → `%23`
     > - Example: password `mou05S@awer` → use `mou05S%40awer` in the URL
   - **Region:** Pick the closest to you (e.g., `US East (N. Virginia)`)
4. Wait ~2 minutes for the database to provision.
5. Go to **Project Settings → Database → Connection string**.
6. Copy the **URI** connection string. It looks like:
   ```
   postgresql://postgres:hvhpzPkTmejXNKqF@db.zdvyuqjedffkqfczplgv.supabase.co:5432/postgres
   ```

---

## Step 2: Update Prisma Schema for PostgreSQL

The current schema uses SQLite. PostgreSQL needs one small change:

**Edit `prisma/schema.prisma`:**

Change:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

That's it. The schema is already compatible — `@default(now())`, `@default(cuid())`, enums, and all field types work in PostgreSQL.

---

## Step 3: Update Build & Start Scripts

The project now compiles the server TypeScript to JavaScript for production (instead of relying on `tsx` at runtime).

**Edit `package.json`:**

Find the `"build"` and `"start"` lines and ensure they are:

```json
"build": "tsc --noEmit && vite build && tsc -p tsconfig.server.json",
"start": "node dist-server/server/index.js",
```

> The build command compiles:
> 1. TypeScript type-checking (`tsc --noEmit`)
> 2. Vite frontend build (`vite build`)
> 3. Server TypeScript compilation to CommonJS (`tsc -p tsconfig.server.json`) which outputs to `dist-server/`
>
> The start command uses compiled Node.js instead of `tsx` for reliability and faster startup.

Also ensure these helper scripts exist:
```json
"db:push": "prisma db push && prisma generate",
"db:migrate": "prisma migrate dev --name init",
```

---

## Step 4: Create a Render Deployment Config

Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: moussawer
    env: node
    buildCommand: npm install && npm run build && npx prisma db push && npx prisma generate
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: DATABASE_URL
        fromDatabase:
          name: moussawer-db
          property: connectionString
      - key: JWT_SECRET
        value: d6fb73ec361ec5bd4bc60f8375e5f310
```

> **Note:** Render's `fromDatabase` references a Render PostgreSQL database. Since we're using Supabase instead, we'll set `DATABASE_URL` manually in the next step.

---

## Step 5: Deploy to Render.com

1. Go to [render.com](https://render.com) and sign up (GitHub login works).
2. Click **"New +" → "Web Service"**.
3. Connect your GitHub repository.
4. Fill in:
   - **Name:** `moussawer`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run build && npx prisma generate
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Plan:** **Free** ($0/month)

5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string from Step 1 |
   | `JWT_SECRET` | A random long string (e.g., `openssl rand -hex 32`) |
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |

6. Click **"Deploy Web Service"**.

Render will build and deploy. The first deploy takes ~3-5 minutes.

---

## Step 6: Push the Database Schema

After the first deploy succeeds, you need to create the database tables and seed data.

> **⚠️ Render free tier does NOT include Shell access.** Use one of these alternatives:

### Option A: Run locally (easiest)

Run these commands on your local machine with the Supabase connection string:

```bash
export DATABASE_URL="postgresql://postgres.zdvyuqjedffkqfczplgv:hvhpzPkTmejXNKqF@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Push the schema
npx prisma db push

# Seed the database
npm run db:seed
```

> **⚠️ IPv6 note:** Supabase free-tier direct DB endpoint (port 5432) is IPv6-only. Use the **connection pooler** (port 6543) instead, which has IPv4 support. The pooler host is `aws-0-us-east-1.pooler.supabase.com` and the username format is `postgres.<project-ref>`.
>
> **⚠️ PgBouncer flags:** When using the pooler with Prisma, append `?pgbouncer=true&connection_limit=1` to the connection string. This tells Prisma to avoid session-level features that PgBouncer (transaction mode) doesn't support.

### Option B: Use Supabase SQL Editor

1. Go to your Supabase dashboard → **SQL Editor**.
2. To get the schema SQL, run locally:
   ```bash
   export DATABASE_URL="postgresql://postgres:hvhpzPkTmejXNKqF@db.zdvyuqjedffkqfczplgv.supabase.co:5432/postgres"
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   ```
3. Copy the contents of `schema.sql` and paste it into Supabase SQL Editor, then click **Run**.
4. For seed data, run locally:
   ```bash
   npx tsx prisma/seed.ts
   ```
   This will insert data directly into your Supabase database.

### Option C: Use a startup script (automatic on deploy)

Add a `postinstall` script to `package.json` that runs `prisma db push` automatically on every deploy:

```json
"scripts": {
  "postinstall": "npx prisma generate && npx prisma db push",
  ...
}
```

Then update your Render build command to:
```bash
npm install && npm run build
```

The `postinstall` will run automatically after `npm install`, pushing the schema before the app starts.

> **Note:** This won't seed data. You still need to run `npm run db:seed` once via Option A or B.

---

## Step 7: Access Your App

Your app will be at: `https://moussawer.onrender.com`

- Web app: `https://moussawer.onrender.com`
- API: `https://moussawer.onrender.com/api/v1`
- Swagger UI: `https://moussawer.onrender.com/api-docs`

### Test accounts (after seeding):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password` |
| Photographer | `photographer-one@example.com` | `password` |
| Client | `client@example.com` | `password` |

---

## Important Notes

### Render Free Tier Limitations

- **Sleeps after inactivity:** After 15 minutes of no requests, Render puts the service to sleep. The first request after sleep takes ~30 seconds to wake up.
- **750 hours/month:** Enough for one service running 24/7. If you add more services, you'll need to manage hours.
- **No custom domain** on free tier (uses `*.onrender.com`).

### Keeping It Awake (Optional)

If you want to prevent sleeping, you can use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your app every 10 minutes.

### Supabase Free Tier Limitations

- **500 MB database storage** — plenty for testing/MVP
- **2 GB bandwidth** — enough for light usage
- **No backups** on free tier (but data persists)
- **Pauses after 1 week of inactivity** — but your app waking Render will also wake Supabase

---

## Alternative: Fly.io + Supabase

If Render doesn't work for you, try **Fly.io**:

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Deploy: `fly launch` (follow prompts)
4. Set secrets: `fly secrets set DATABASE_URL="<supabase-url>" JWT_SECRET="<secret>"`

Fly.io free tier: 3 shared VMs, 256MB RAM each, 3GB storage.

---

## Troubleshooting

### "Expected ',' or '}' after property value in JSON" when running `prisma db push`

**Most likely cause: invalid `package.json`.** Prisma reads `package.json` to find the seed command config. If `package.json` has malformed JSON (e.g., a duplicated key from editing scripts), Prisma will fail with this error.

**Fix:** Validate your `package.json`:
```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('Valid JSON')"
```
If it fails, check the `"scripts"` section for duplicate keys like `"db:push": "db:push": "..."` (the key appears twice). Fix it to a single `"db:push": "prisma db push && prisma generate"`.

**Less common cause: special characters in DATABASE_URL.** If your password contains `@`, `:`, `/`, `%`, or `#`, they break URL parsing.

**Fix:** URL-encode special characters in your password:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `%` → `%25`
- `#` → `%23`

Example: `mou05S@awer` → `mou05S%40awer`

So instead of:
```bash
export DATABASE_URL="postgresql://postgres:mou05S@awer@db.xxx.supabase.co:5432/postgres"
```
Use:
```bash
export DATABASE_URL="postgresql://postgres:mou05S%40awer@db.xxx.supabase.co:5432/postgres"
```

### "Prisma schema engine failed"
This was a local issue. On Render/Fly, Prisma works normally with PostgreSQL.

### "Can't connect to database"
- Make sure your Supabase project is active (not paused)
- Check that the connection string is correct in Render env vars
- In Supabase dashboard → **Database** → check if **Connection pooling** is enabled (use the pooled URL if needed)

### "App crashes on startup"
Check the Render logs. Common issues:
- Missing `DATABASE_URL` env var
- Prisma client not generated (add `npx prisma generate` to build command)
- Port mismatch (Render uses `PORT` env var, your app reads it from `config.ts`)

### "Data lost after deploy"
This means you're still using SQLite. Make sure `DATABASE_URL` points to your Supabase PostgreSQL URL, not `file:./dev.db`.

---

## Cost Summary

| Service | Cost | What you get |
|---|---|---|
| Supabase | **$0/month** | 500 MB PostgreSQL, unlimited API requests |
| Render.com | **$0/month** | 750 hours compute, 512 MB RAM |
| **Total** | **$0/month** | Full-stack app with permanent database |

No credit card required for either service.
