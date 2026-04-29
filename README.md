# Moussawer

Moussawer is an API-first photography marketplace MVP connecting clients, photographers, and admins through discovery, calendar-aware booking, messaging, incidents/disputes, portfolio management, reviews, notifications, and admin oversight.

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma Client, SQLite, Zod, JWT, bcrypt.
- **Frontend:** React, Vite, React Router, lucide-react, plain CSS.
- **Testing:** Vitest + Supertest API integration tests.
- **API docs:** OpenAPI document served at `/api/v1/openapi.json` and Swagger UI at `/api-docs`.

This stack keeps the backend cleanly consumable by the web app and a future Android client. The web UI calls the same `/api/v1` endpoints that mobile would use.

## Local Setup

```bash
cp .env.example .env
npm install
npm run db:reset
npm run dev
```

Then open:

- Web app: http://localhost:5173
- API: http://localhost:4000/api/v1
- Swagger UI: http://localhost:4000/api-docs

The Prisma schema engine failed on `prisma db push` in this environment with an empty diagnostic, so `npm run db:push` currently generates SQL from `prisma/schema.prisma` and applies it with `sqlite3`. The Prisma schema remains the source of truth.

## Test Accounts

```txt
admin@example.com / password
photographer-one@example.com / password
client@example.com / password
```

Additional seeded photographers:

```txt
photographer-two@example.com / password
photographer-three@example.com / password
```

## Useful Commands

```bash
npm run dev        # API + web dev servers
npm run dev:api    # API only
npm run dev:web    # Vite only
npm run db:reset   # rebuild SQLite schema and seed data
npm test           # reset DB and run API integration tests
npm run lint       # ESLint
npm run build      # TypeScript check and production frontend build
```

## Implemented MVP

- Auth: register, login, logout response, current user, JWT bearer auth, password hashing, role guards.
- Public pages: landing, discovery, profile, login, register, support.
- Photographer discovery: location/category/price/rating/date filters, sorting, pagination metadata.
- Photographer profiles: services, portfolio, reviews, availability preview, booking CTA.
- Calendar availability: weekly recurring rules, calendar blocks, conflict checks, past-date validation.
- Bookings: client creation, photographer status changes, client pending cancellation, admin visibility, audit logs.
- Messaging: conversations, messages, read state, booking-linked conversations.
- Incidents/disputes: user creation, admin updates, dispute comments.
- Portfolio: photographer CRUD, admin-capable moderation flag.
- Reviews: completed-booking rule and one review per booking enforced by schema.
- Notifications: stored in DB with API access.
- Dashboards: client/photographer/admin summaries powered by API data.
- Admin panel (`/admin`): dedicated UI with tabs for Overview (stats), Users (suspend/activate), Incidents (review/resolve/close), Disputes (review/resolve/reject), Categories (create), and Activity (audit log). Role-guarded via `AdminRoute` component; only ADMIN role can access.
- Seed data: users, photographers, categories, services, availability, portfolio, bookings, messages, cases, favorites, notifications.

## Mobile/API Readiness

- All important actions are exposed under `/api/v1`.
- Web uses bearer-token API auth instead of browser-only sessions.
- Responses consistently return `{ data }` or `{ data, meta }`.
- Errors consistently return `{ error: { code, message, details } }`.
- DTO/resource serializers avoid exposing password hashes.
- Pagination metadata exists on photographer discovery.
- File and media fields are URL-based placeholders, ready to be replaced by multipart upload/object storage.
- OpenAPI is available for Android planning and client generation prep.

## Known Limitations

- Payments, refunds, payout accounting, and push notifications are placeholders.
- Image upload storage is URL-based only; S3/object storage should be added next.
- Timezone handling is consistent for seeded local availability, but should move to a dedicated timezone library before launch.
- Real-time messaging is not implemented; the MVP uses refresh/polling-style APIs.
- Admin moderation UI has basic workflows (suspend/activate users, review/resolve/close incidents, review/resolve/reject disputes, create categories, view audit logs). Full moderation queues (portfolio approval, review moderation) are not yet built into the UI.
- `npm run db:push` uses a SQLite SQL-generation workaround because Prisma's db push schema engine failed in this container.

## Recommended Next Missions

1. Add object storage uploads for portfolio, message attachments, and evidence.
2. Add Playwright E2E coverage for guest, client, photographer, and admin browser flows.
3. Add payment/refund architecture with clear booking cancellation policy fields.
4. Add timezone-hard calendar handling with `date-fns-tz` or equivalent.
5. Add WebSocket or SSE messaging and notification delivery.
6. Add admin moderation queues for portfolio, reviews, and message safety review.
