# AI Reflection & Automation Ideas

## MCP Servers Used

- Local filesystem and shell tooling were used for repository inspection, implementation, build, lint, tests, and database setup.
- MCP resource discovery was checked; no project-specific MCP resources were exposed.

## MCP Servers That Would Help

- A browser/Playwright MCP server would help validate responsive UI flows with screenshots.
- A database MCP server for SQLite inspection would make schema and seed verification more ergonomic.
- A GitHub MCP server would help publish the branch and open a PR if a remote repository existed.

## Repetitive Tasks To Automate

- A `scripts/smoke-api.sh` command could log in each role and hit health, discovery, booking, message, and admin endpoints.
- A `scripts/create-demo-booking.sh` command could create a fresh future booking for demos.
- A `scripts/check-calendar-conflicts.sh` command could verify availability and double-booking behavior.

## Useful Future Commands

- `npm run e2e` for Playwright flows.
- `npm run openapi:check` to validate the OpenAPI document.
- `npm run seed:demo-heavy` for richer photographer and booking datasets.
- `npm run storage:local` for local upload fixtures.

## Custom MCP Ideas

- A marketplace-domain MCP server that can generate scenario data, booking timelines, dispute timelines, and synthetic conversation histories.
- A calendar validation MCP server that fuzzes availability rules, timezone transitions, and overlapping booking windows.
- A design review MCP server that captures responsive screenshots and flags layout overlap/regression risks.

## Future Agent Docs

- Add endpoint-by-endpoint request/response examples once the API stabilizes.
- Add database relationship diagrams for booking, conversations, incidents, disputes, and notifications.
- Add a release checklist for auth/security, privacy, and moderation workflows.

## Technical Debt And Risk

- Timezone handling should be hardened before production.
- Uploads and media moderation need real storage and scanning.
- Admin moderation is functional but not deep enough for a live marketplace.
- Payments/refunds are intentionally absent from the MVP.

## Priority Next Tasks

1. Add Playwright E2E tests for guest, client, photographer, and admin flows.
2. Add S3-compatible upload abstraction for portfolio and evidence.
3. Harden timezone handling and calendar sync boundaries.
4. Add payment/refund architecture.
5. Add real-time messaging or push notification delivery.
