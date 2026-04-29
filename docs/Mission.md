# Moussawer — Project Mission (Current State)

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| **Runtime**    | Node.js 22+, TypeScript 5                               |
| **Backend**    | Express 4, Prisma Client 6, Zod 3, JWT, bcrypt          |
| **Frontend**   | React 19, Vite 6, React Router 7, lucide-react, CSS     |
| **Database**   | SQLite (via Prisma ORM)                                 |
| **API docs**   | OpenAPI / Swagger UI                                    |
| **Testing**    | Vitest + Supertest                                      |
| **Linting**    | ESLint 9 + typescript-eslint                            |

## Why This Stack

- **Node.js + TypeScript:** Single language across backend and frontend, fast iteration, excellent tooling.
- **Express:** Minimal, well-understood framework; easy to reason about and extend.
- **Prisma + SQLite:** Type-safe database access; SQLite is zero-config for development/MVP; Prisma makes schema changes safe and migration-ready.
- **React + Vite:** Modern, fast frontend tooling with good developer experience.
- **API-first architecture:** All actions exposed under `/api/v1` with JWT auth, making it ready for a future Android/mobile client without major rewrites.

## Core Features (Already Built)

- [x] Authentication & Role-Based Access (register, login, logout, JWT, role guards)
- [x] Public Pages (landing, photographer discovery, profile, login, register, support)
- [x] Photographer Discovery (location/category/price/rating/date filters, sorting, pagination)
- [x] Photographer Profiles (services, portfolio, reviews, availability preview, booking CTA)
- [x] Calendar & Availability (weekly recurring rules, calendar blocks, conflict checks, past-date validation)
- [x] Booking System (client creation, photographer status changes, cancellation, admin visibility, audit logs)
- [x] Messaging (conversations, messages, read state, booking-linked conversations)
- [x] Incidents & Disputes (user creation, admin management, dispute comments)
- [x] Portfolio Management (photographer CRUD, admin moderation flag)
- [x] Reviews & Ratings (completed-booking rule, one review per booking)
- [x] Notifications (stored in DB with API access)
- [x] Dashboards (client/photographer/admin summaries)
- [x] Seed Data (users, photographers, categories, services, availability, portfolio, bookings, messages, cases, favorites, notifications)

## Architecture Principles

- **API-first:** All endpoints under `/api/v1`, consistent JSON response format `{ data }` / `{ data, meta }` / `{ error }`
- **Mobile-ready:** JWT bearer auth, no browser-only sessions, pagination metadata, stable resource shapes
- **Role-based:** `ADMIN`, `CLIENT`, `PHOTOGRAPHER` with authorization checks on every sensitive action
- **Validation:** Zod schemas throughout
- **Documented:** OpenAPI spec served at `/api-docs`

## Running Locally

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

## Test Accounts

```
admin@example.com / password
photographer-one@example.com / password
photographer-two@example.com / password
photographer-three@example.com / password
client@example.com / password
```

## Useful Commands

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start API + web dev servers concurrently        |
| `npm run dev:api`   | Start API server only                           |
| `npm run dev:web`   | Start Vite frontend only                        |
| `npm run db:reset`  | Rebuild SQLite schema + seed data               |
| `npm test`          | Reset DB + run API integration tests            |
| `npm run lint`      | Run ESLint                                      |
| `npm run build`     | TypeScript check + production frontend build    |

## API Reference

Interactive docs: http://localhost:4000/api-docs
Raw OpenAPI: http://localhost:4000/api/v1/openapi.json

Key endpoint groups:

- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me`, `PATCH /me`
- **Discovery:** `GET /categories`, `GET /photographers`, `GET /photographers/:identifier`
- **Calendar:** `GET /photographers/:identifier/availability`, `GET/POST/DELETE /me/availability`, `POST /me/calendar-blocks`
- **Bookings:** `GET /bookings`, `POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status`
- **Messaging:** `GET/POST /conversations`, `GET/POST /conversations/:id/messages`, `PATCH /conversations/:id/read`
- **Incidents:** `GET/POST /incidents`, `PATCH /admin/incidents/:id`
- **Disputes:** `GET/POST /disputes`, `GET/POST /disputes/:id/comments`, `PATCH /admin/disputes/:id`
- **Portfolio:** `GET/POST /portfolio`, `PATCH/DELETE /portfolio/:id`
- **Reviews:** `GET /photographers/:identifier/reviews`, `POST /reviews`
- **Notifications:** `GET /notifications`, `PATCH /notifications/:id/read`
- **Admin:** `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id`, `POST /admin/categories`, `GET /admin/activity`

## Known Limitations

- Payments, refunds, and payout accounting are placeholders.
- Image uploads are URL-based; S3/object storage should be added next.
- Timezone handling is consistent for seeded local data but needs hardening for production.
- Real-time messaging is not implemented (polling-based).
- Admin moderation UI is intentionally minimal for MVP.
- Prisma `db push` uses a SQLite SQL-generation workaround (engine fails in this container).

## Recommended Next Steps

1. Add S3-compatible upload abstraction for portfolio, message attachments, and evidence.
2. Add Playwright E2E coverage for all user roles.
3. Add payment/refund architecture with cancellation policy fields.
4. Harden timezone handling with `date-fns-tz` or equivalent.
5. Add real-time messaging (WebSocket/SSE).
6. Add admin moderation queues for portfolio, reviews, and messages.
