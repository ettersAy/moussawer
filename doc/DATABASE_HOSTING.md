# Database hosting and connection troubleshooting

Moussawer uses Prisma with PostgreSQL.

## Current setup

- Web/API host: Render Web Service
- Database host: Neon PostgreSQL free tier
- Runtime `DATABASE_URL`: Neon pooled endpoint (with `-pooler` in hostname and `pgbouncer=true`)
- Runtime `DIRECT_URL`: Neon direct endpoint (no `-pooler`, no `pgbouncer`) — used for Prisma migrations

## Required environment variables

Set these in the Render dashboard AND in local `.env`, not in Git:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<host>.<region>.aws.neon.tech/<db>?sslmode=require"
JWT_SECRET="<openssl-rand-hex-32>"
NODE_ENV="production"
PORT="4000"
```

Never commit real values in `.env`, `render.yaml`, README files, or docs.

## Common connection failures

1. `DIRECT_URL` not set — the Prisma schema references `env("DIRECT_URL")`, so both vars must exist.
2. Pooled URL used for `DIRECT_URL` or vice versa — the direct URL must NOT have `-pooler` or `pgbouncer=true`.
3. Missing or malformed `DATABASE_URL` in the Render dashboard.
4. Neon IP restrictions — check the Neon dashboard that connections from Render's IP range are allowed.
5. Database schema was never pushed after creating the DB.

## Deployment rule

Schema pushes should be done manually from local (which connects to the same Neon database):

```bash
npm run db:push
npm run db:seed
```

The Render build command handles `prisma generate` automatically. No separate `db:push` needed on deploy.

## Verify production DB connectivity

After deploy, open:

```txt
/api/v1/health
```

If `/health` returns OK, the database connection is working.

## Security note

Sensitive credentials (DATABASE_URL, DIRECT_URL, JWT_SECRET) must only exist in:
1. Local `.env` (gitignored)
2. Render.com dashboard environment variables

Never commit these values. `.env.example` has placeholder templates only.
