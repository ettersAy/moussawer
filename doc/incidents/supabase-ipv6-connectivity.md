# Incident: Supabase IPv6-Only Connectivity Issue

**Date:** 2026-05-03
**Severity:** Medium (blocked migration, resolved via workaround)
**Status:** Resolved

## Summary

During the database migration from SQLite (local) to Supabase PostgreSQL (cloud), `npx prisma db push` failed with error `P1001: Can't reach database server`. The root cause was that Supabase's free-tier PostgreSQL endpoint is **IPv6-only** — it has no IPv4 A record — and the local machine had no IPv6 default route configured.

## Timeline

1. **Attempted `npx prisma db push`** — failed with `P1001`
2. **Checked `.env`** — `DATABASE_URL` was still pointing to SQLite (`file:./dev.db`). Fixed to Supabase URL.
3. **Retried** — same `P1001` error
4. **Diagnosed DNS resolution:**
   - `nslookup db.zdvyuqjedffkqfczplgv.supabase.co` returned only an IPv6 address (`2600:1f16:c40:6e02:3b99:72e2:a663:2493`)
   - No IPv4 A record existed
5. **Tested connectivity:**
   - `ping6` to the IPv6 address → "Network is unreachable"
   - `ip -6 route show default` → empty (no IPv6 default route)
   - `ping` to `google.com` → works (IPv4)
   - `ping6` to `google.com` → "Network is unreachable"
6. **Confirmed IPv6 is not available** on the local machine (link-local only)
7. **Workaround:** Used Supabase SQL Editor (web UI) to run the schema and seed SQL directly

## Root Cause

Supabase's free-tier PostgreSQL databases are hosted on infrastructure that only exposes IPv6 addresses. The DNS record for the database host is an **AAAA record only** (no A record). The local development machine has:

- IPv4 connectivity (working)
- Link-local IPv6 address only (`fe80::...`)
- **No IPv6 default route** — no router/gateway configured for IPv6 traffic

This means any tool that resolves the hostname to an IPv6 address and attempts to connect via IPv6 will fail with "Network is unreachable".

## Affected Systems

- `npx prisma db push` — cannot connect
- `npx prisma db pull` — cannot connect
- `npx prisma generate` — works (no DB connection needed)
- `npx prisma migrate dev` — cannot connect
- `npx prisma studio` — cannot connect
- Any direct `psql` connection — cannot connect
- Any Node.js/Express app connecting via `DATABASE_URL` — cannot connect

## Workaround Applied

Since direct TCP connections from the local machine are impossible due to IPv6, the **Supabase SQL Editor** (web UI) was used instead:

1. **Generate schema SQL** from Prisma schema:
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   ```

2. **Generate seed SQL** from Prisma seed data:
   - Manually converted `prisma/seed.ts` (TypeScript/Prisma) to `seed.sql` (raw SQL INSERT statements)
   - Replaced Prisma-specific features (`createMany`, `upsert`, `connect`) with plain SQL
   - Used `NOW()` and `INTERVAL` for dynamic timestamps

3. **Paste and run in Supabase SQL Editor:**
   - First: `schema.sql` (CREATE TYPE, CREATE TABLE, CREATE INDEX, ALTER TABLE)
   - Second: `seed.sql` (INSERT statements for all test data)

4. **Verify:**
   - Table Editor in Supabase dashboard showed all 18 tables with correct schema
   - Data was visible in all tables

## Files Created

| File | Purpose |
|---|---|
| `schema.sql` | Full PostgreSQL schema (CREATE statements for all 18 tables + enums) |
| `seed.sql` | Complete seed data (INSERT statements for all test data) |

## How to Handle Future Schema Changes

Since direct `prisma db push` does not work, any future schema changes must follow this process:

### Option A: Generate SQL diff and paste into Supabase SQL Editor (recommended)

```bash
# After editing prisma/schema.prisma:
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > migration.sql
# ^ This doesn't work for comparing same file. Instead:
# 1. Save current schema as snapshot
cp prisma/schema.prisma prisma/schema.snapshot.prisma
# 2. Edit prisma/schema.prisma with your changes
# 3. Generate diff
npx prisma migrate diff --from-schema-datamodel prisma/schema.snapshot.prisma --to-schema-datamodel prisma/schema.prisma --script > migration.sql
# 4. Review migration.sql, then paste into Supabase SQL Editor
# 5. Clean up
rm prisma/schema.snapshot.prisma
```

### Option B: Use Prisma Migrate with shadow database (requires IPv6)

If IPv6 becomes available, use:
```bash
npx prisma migrate dev --name describe_your_change
```

### Option C: Direct SQL in Supabase SQL Editor

For simple changes (add a column, create an index), write the SQL directly in the Supabase SQL Editor.

## Connection Details

- **Host:** `db.zdvyuqjedffkqfczplgv.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `hvhpzPkTmejXNKqF`
- **Connection string:** `postgresql://postgres:hvhpzPkTmejXNKqF@db.zdvyuqjedffkqfczplgv.supabase.co:5432/postgres`
- **IPv6 address:** `2600:1f16:c40:6e02:3b99:72e2:a663:2493`
- **IPv4 address:** None (AAAA record only)

## Lessons Learned

1. **Supabase free-tier is IPv6-only** — always check DNS before assuming connectivity issues are credential-related
2. **`P1001` does not always mean wrong credentials** — it can mean network unreachability
3. **Always verify DNS resolution** when connecting to a new database host:
   ```bash
   nslookup <hostname>
   # or
   dig AAAA <hostname>
   ```
4. **Keep `schema.sql` and `seed.sql` as artifacts** — they serve as a backup deployment method when direct Prisma connections are unavailable
5. **The Supabase SQL Editor is a reliable fallback** for schema deployment and data seeding

## Resolution: Use Supabase Connection Pooler (PgBouncer)

The Supabase connection pooler (`aws-0-us-east-1.pooler.supabase.com`, port 6543) has **IPv4 support** and works from both local machines and Render.com.

**Connection string format:**
```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

For this project:
```
postgresql://postgres.zdvyuqjedffkqfczplgv:hvhpzPkTmejXNKqF@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key differences from direct DB connection:**
| | Direct DB | Pooler (PgBouncer) |
|---|---|---|
| Host | `db.<project-ref>.supabase.co` | `aws-0-<region>.pooler.supabase.com` |
| Port | 5432 | 6543 |
| User | `postgres` | `postgres.<project-ref>` |
| IPv4 | ❌ No (AAAA only) | ✅ Yes (A records) |
| Connection pooling | ❌ No | ✅ Yes (transaction mode) |

**Note:** The pooler runs in **transaction mode**, which means some operations that require session-level features (e.g., `LISTEN/NOTIFY`, prepared statements with session state) may not work. For standard CRUD operations via Prisma, it works perfectly.

**Prisma PgBouncer configuration:** When using the pooler with Prisma, append `?pgbouncer=true&connection_limit=1` to the connection string. This tells Prisma to avoid session-level features that PgBouncer doesn't support. Without these flags, Prisma may hang indefinitely on `$connect()`.

## Future Considerations

- If IPv6 becomes available on the local machine (e.g., via ISP upgrade or VPN with IPv6), direct `prisma db push` will work
- For production deployment (Render.com), always use the pooler (port 6543) since Render may not have IPv6
- The pooler also helps with connection limits (Supabase free tier allows 15 connections)
