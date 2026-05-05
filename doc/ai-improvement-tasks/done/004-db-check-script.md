# Problem
Database connection testing required a trio of commands (`psql`, `nslookup`, `prisma db push`) repeated multiple times. When Supabase cloud was unreachable, diagnosing the issue took several manual steps.

# Improvement Needed
Create a `scripts/db-check.sh` script that: tests DB connectivity, reports the database type (local Docker vs cloud Supabase), verifies schema is in sync, and prints a clear status. Include fallback guidance when Supabase free tier is paused.

# Expected Result
Future AI agents diagnose database issues with a single command instead of trial-and-error connection attempts.
