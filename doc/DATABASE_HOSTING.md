# Database hosting and connection troubleshooting

Moussawer uses Prisma with PostgreSQL.

## Recommended free setup

Use this setup first:

- Web/API host: Render Web Service
- Database host: Supabase PostgreSQL free tier
- Runtime `DATABASE_URL`: Supabase shared pooler / transaction mode URL on port `6543`

Do not deploy the current Express server as a static-only Vercel frontend. The API is a long-running Express app and should run as a Node web service unless it is refactored into serverless functions.

## Required environment variables

Set these in the hosting dashboard, not in Git:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="<openssl-rand-hex-32>"
NODE_ENV="production"
PORT="4000"
```

Never commit real values in `.env`, `render.yaml`, README files, or docs.

## Common connection failures

1. Direct Supabase URL used instead of pooler URL.
2. Port `5432` used from a host that cannot reach IPv6-only direct endpoints.
3. Missing `pgbouncer=true` with Supabase transaction pooler.
4. Missing or malformed `DATABASE_URL` in the host dashboard.
5. Supabase project is paused, deleted, or the database password changed.
6. Database schema was never pushed after creating the DB.

## Deployment rule

Production build should not run `prisma db push` automatically.

Use this manually after configuring `DATABASE_URL`:

```bash
npm run db:push
npm run db:seed
```

Production host build/start:

```bash
npm ci
npm run db:generate
npm run build
npm start
```

## Verify production DB connectivity

After deploy, open:

```txt
/api/v1/health
/api/v1/health/db
```

If `/health` works but `/health/db` fails, the web host is running but the DB URL, DB password, network path, or Supabase project status is wrong.

## Alternative free DB hosts

Best alternatives if Supabase keeps failing:

1. Neon PostgreSQL free tier — minimal code change.
2. Prisma Postgres free tier — designed for Prisma projects.
3. Railway PostgreSQL — good developer experience, but free limits can change.

Avoid switching to MySQL or SQLite for production unless there is a strong reason. PostgreSQL is already wired into `prisma/schema.prisma`.

## Security note

A real Supabase connection string and JWT secret were previously committed in `render.yaml`. Rotate both secrets before deploying again:

1. Change the Supabase database password.
2. Generate a new `JWT_SECRET` with `openssl rand -hex 32`.
3. Update the values only in the hosting dashboard.
