# Moussawer App Audit Report — Round 1

**Date:** 2026-05-05 | **Auditor:** Claude Code

---

## 1. EXECUTIVE SUMMARY

Moussawer is a well-architected MVP for a photography marketplace. The codebase follows clean patterns (Express routes, Zod validation, Prisma ORM, React with Context). All core features work correctly — auth, discovery, bookings, messaging, cases, portfolio, reviews, favorites, notifications, photographer dashboard, and admin panel.

**Key metrics:**
- 33 API endpoints, all functional
- 20 database models with 5 enums
- 3 user roles (Admin, Client, Photographer)
- 11 frontend routes, all loading correctly
- 0 server-side errors in logs during testing

---

## 2. FIXES APPLIED DURING THIS AUDIT

### Critical
| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Hardcoded JWT secret fallback `"dev-only-change-me"` | `server/config.ts:7` | Now throws error if JWT_SECRET not set |
| 2 | No rate limiting on any endpoint | `server/app.ts` | Added global 500/15min limiter + strict 10/15min auth limiter |
| 3 | DisputeComment.authorId missing relation to User | `prisma/schema.prisma:283` | Added `author User @relation` and reverse field |
| 4 | Missing FK indexes on all key tables | `prisma/schema.prisma` | Added 13 indexes on Booking, Message, Notification, PortfolioItem, Incident, Dispute, Review, ActivityLog, DisputeComment |
| 5 | `JSON.parse` crash risk on activity logs | `server/routes/admin.routes.ts:366` | Replaced with `safeJson()` wrapper |
| 6 | No pagination on activity logs | `server/routes/admin.routes.ts` | Added pagination with meta |
| 7 | Password minimum 6 chars (OWASP recommends 8+) | `server/routes/auth.routes.ts:21` | Changed to `min(8)` |

---

## 3. CORE FEATURES — WHAT EXISTS & HOW TO IMPROVE

### 3.1 Authentication
**Status:** Basic JWT auth works. Login, register, logout, profile fetch/update.
**Improvements needed:**
- [ ] **Password reset flow** — Forgot/reset password with email token
- [ ] **Email verification** — Verify email on registration to prevent fake accounts
- [ ] **Token refresh** — Replace static 14-day JWT with access/refresh token pair (access: 15min, refresh: 14d)
- [ ] **Server-side logout** — Token blacklist using Redis or DB table with `jti` tracking
- [ ] **Account lockout** — Lock account after 5 failed attempts for 15 minutes
- [ ] **Password confirmation** — Add confirm-password field on registration (frontend)
- [ ] **2FA/TOTP** — Two-factor authentication for photographers and admins
- [ ] **Social login** — Google/Apple OAuth for clients (lower friction onboarding)

### 3.2 Photographer Discovery
**Status:** Search with filters (q, location, category, price range, rating, sort). Pagination works.
**Improvements needed:**
- [ ] **Full-text search** — Replace `LIKE '%q%'` with PostgreSQL `tsvector` or Elasticsearch for relevance-ranked search
- [ ] **Location-based search** — Geospatial search with lat/lng + radius, not just string match
- [ ] **Availability-aware sorting** — Current N+1 query pattern (1 query + N availability checks) should be replaced with a single DB query using joins
- [ ] **Map view** — Show photographers on a map (Mapbox/Google Maps)
- [ ] **Photo gallery preview** — Show portfolio thumbnails directly in search results
- [ ] **Save/filter search** — Allow clients to save search criteria and get notified of new matches

### 3.3 Booking System
**Status:** Create booking with availability validation, status machine (PENDING→CONFIRMED/CANCELLED→COMPLETED). Works correctly.
**Improvements needed:**
- [ ] **Calendar UI** — Interactive calendar to pick available slots visually instead of manual date entry
- [ ] **Pricing calculator** — Show price estimate based on service + duration + add-ons BEFORE booking
- [ ] **Booking deposits** — Require partial payment/deposit to confirm booking (Stripe integration)
- [ ] **Cancellation policy** — Configurable cancellation windows with automatic refund rules
- [ ] **Recurring bookings** — Weekly/monthly repeat booking support
- [ ] **Booking reminders** — Email/SMS reminders 24h before scheduled session
- [ ] **Calendar sync** — iCal/Google Calendar export for photographers and clients
- [ ] **Buffer time** — Allow photographers to set buffer time between bookings (e.g., 30 min for setup/cleanup)

### 3.4 Messaging
**Status:** Basic conversation + message creation. Messages display with read tracking.
**Improvements needed:**
- [ ] **Real-time messaging** — WebSocket (Socket.io) or SSE for live message delivery instead of polling
- [ ] **Typing indicators** — Show when the other party is typing
- [ ] **File attachments** — Upload and share images, contracts, mood boards
- [ ] **Message templates** — Canned responses for photographers (booking confirmation, shoot prep instructions)
- [ ] **Unread counts** — Show unread count badge in navigation
- [ ] **Conversation search** — Search within messages
- [ ] **Message notifications** — Push/email when new message arrives (currently only in-app)

### 3.5 Portfolio Management
**Status:** CRUD for portfolio items with title, description, imageUrl, tags, featured flag.
**Improvements needed:**
- [ ] **File upload** — Actual image upload endpoint with S3/Cloudinary storage, resize/optimize
- [ ] **Drag-and-drop reorder** — Visual reordering of portfolio items
- [ ] **Multi-image galleries** — Support for gallery sets within a single portfolio item
- [ ] **Video support** — Short behind-the-scenes clips or highlight reels
- [ ] **Watermarking** — Automatic watermark overlay on portfolio images
- [ ] **View analytics** — Track which portfolio items get the most views/engagement
- [ ] **Client galleries** — Private galleries shared with specific clients after a shoot

### 3.6 Reviews & Ratings
**Status:** One review per completed booking, 1-5 rating, comment, moderation flag. Updates photographer aggregate.
**Improvements needed:**
- [ ] **Review responses** — Allow photographers to publicly respond to reviews
- [ ] **Verified review badge** — Mark reviews from verified completed bookings
- [ ] **Review photos** — Allow clients to attach photos to reviews
- [ ] **Multi-dimensional ratings** — Rate separately on: quality, communication, value, punctuality
- [ ] **Review sorting** — Sort by most helpful, newest, highest/lowest rating
- [ ] **Review analytics** — Rating trends over time for photographer dashboard

### 3.7 Incidents & Disputes
**Status:** Report incidents and disputes with evidence links, admin review/resolve flow.
**Improvements needed:**
- [ ] **Evidence upload** — Actual file upload for evidence (screenshots, documents)
- [ ] **Dispute resolution workflow** — Mediation step before admin intervention
- [ ] **Automated resolution** — Refund trigger based on dispute outcome
- [ ] **Appeal process** — Allow appealing admin decisions
- [ ] **Status timeline** — Visual timeline of incident/dispute history

### 3.8 Admin Panel
**Status:** Dashboard stats, user CRUD, incident/dispute management, category management, activity logs.
**Improvements needed:**
- [ ] **Role-based permission granularity** — Multiple admin levels (super admin, moderator, support)
- [ ] **Bulk actions** — Bulk suspend/activate users, bulk resolve disputes
- [ ] **Export/Reports** — CSV/PDF export of users, bookings, revenue
- [ ] **Audit trail search** — Search and filter activity logs by action, entity, date range
- [ ] **Content moderation queue** — Review reported portfolio items and reviews before publish
- [ ] **Dashboard charts** — Revenue charts, user growth, booking trends (Chart.js/Recharts)
- [ ] **Photographer verification workflow** — Document upload and verification badge process

### 3.9 Notifications
**Status:** In-app notifications for key events. 50-recent listing with read tracking.
**Improvements needed:**
- [ ] **Push notifications** — Web Push API for browser notifications
- [ ] **Email notifications** — Transactional emails (booking confirm, message received, review request)
- [ ] **SMS notifications** — SMS for urgent reminders (session in 1 hour)
- [ ] **Notification preferences** — Per-user notification channel settings (email on/off, push on/off)
- [ ] **Notification grouping** — Group similar notifications (e.g., "3 new messages from Amir")
- [ ] **Action notifications** — Inline actions (e.g., "Confirm" or "Reschedule" directly from notification)

### 3.10 Favorites
**Status:** Add/remove favorites, list favorites with full photographer details.
**Improvements needed:**
- [ ] **Favorites folders** — Organize favorites into collections (e.g., "Wedding candidates", "Portrait")
- [ ] **Favorites notes** — Private notes on favorited photographers ("Loved his lighting style")
- [ ] **Availability alerts** — Notify when a favorited photographer updates availability
- [ ] **Comparison view** — Side-by-side comparison of 2-3 favorited photographers

---

## 4. MISSING FEATURES THAT SHOULD BE ADDED

### High Priority
1. **Payment integration** — Stripe Connect for client→photographer payments with platform fee
2. **File/image upload** — Cloudinary or S3 for portfolio images, avatars, evidence uploads
3. **Email infrastructure** — Nodemailer/SendGrid for transactional emails (verify email, reset password, booking confirmations)
4. **Real-time messaging** — Socket.io WebSocket for instant messaging
5. **Password reset flow** — Complete forgot/reset password with email link

### Medium Priority
6. **Photographer availability calendar UI** — Interactive calendar for viewing and booking slots
7. **Contracts & agreements** — Digital contract signing (DocuSign/HelloSign API) for booking agreements
8. **Client onboarding wizard** — Guided setup: upload inspiration photos, set preferences, budget range
9. **Photographer verification** — ID/document upload, manual admin review, "Verified" badge
10. **Multi-language support** — i18n for French (Canadian market requirement)
11. **SEO optimization** — SSR/meta tags for photographer profile pages
12. **Referral program** — Referral codes and tracking for client→client and photographer→photographer

### Lower Priority
13. **Blog/content section** — Photography tips, wedding planning guides (content marketing)
14. **Gift cards** — Purchase and redeem gift cards for photography services
15. **Subscription packages** — Recurring photography packages (monthly brand shoots, quarterly headshots)
16. **AI-powered matching** — Match clients to photographers based on style preferences and budget
17. **Mobile app** — React Native app using the same API
18. **Analytics dashboard for photographers** — Views, inquiries, conversion rate, revenue tracking

---

## 5. REMAINING TECHNICAL ISSUES

### Security (High)
| # | Issue | Location |
|---|-------|----------|
| 1 | CSP entirely disabled | `server/app.ts:14` |
| 2 | CORS open to all origins in production | `server/app.ts:15` |
| 3 | JWT stored in localStorage (XSS-exposable) | `src/lib/api.ts:174` |
| 4 | No CSRF protection | Global |
| 5 | 14-day JWT with no refresh mechanism | `server/middleware/auth.ts:89` |
| 6 | No brute force protection beyond rate limiting | `server/routes/auth.routes.ts` |
| 7 | Popularity counter can be gamed (incremented on every view) | `server/routes/discovery.routes.ts:122` |

### Performance (Medium)
| # | Issue | Location |
|---|-------|----------|
| 8 | N+1 query on availability-filtered discovery | `server/routes/discovery.routes.ts:82-101` |
| 9 | Admin stats runs 8 separate count queries | `server/routes/admin.routes.ts:23-43` |
| 10 | No pagination on bookings, conversations, portfolio endpoints | Various routes |
| 11 | Search queries can't use B-tree indexes (case-insensitive LIKE) | `server/routes/discovery.routes.ts` |

### Code Quality (Medium)
| # | Issue | Location |
|---|-------|----------|
| 12 | Duplicate query logic in availability service | `server/services/availability.ts` |
| 13 | Tags stored as comma-separated string | `prisma/schema.prisma:173` |
| 14 | No structured logging or error correlation IDs | `server/utils/http.ts:69` |
| 15 | `metadata` fields stored as String instead of JSON type | `prisma/schema.prisma:321,333` |

### Frontend (Medium)
| # | Issue | Location |
|---|-------|----------|
| 16 | No React error boundary | `src/App.tsx` |
| 17 | No 401 auto-redirect interceptor | `src/lib/api.ts` |
| 18 | Hardcoded demo credentials in LoginPage | `src/pages/LoginPage.tsx:9-10` |
| 19 | No loading states on submit buttons | Login/Register pages |
| 20 | No client-side form validation | Login/Register pages |
| 21 | No password visibility toggle | Login/Register pages |
| 22 | No toast/notification UI component | Global |
| 23 | No skeleton loaders | Various pages |
| 24 | No server-state caching (React Query/SWR) | `src/lib/api.ts` |

---

## 6. ARCHITECTURE RECOMMENDATIONS

1. **Move to access/refresh token pattern** — Add Redis for token blacklisting and refresh token storage
2. **Introduce service layer pattern consistently** — Move business logic from routes to dedicated service files (already started with availability + notifications)
3. **Add API versioning headers** — Currently only `/v1`, should add deprecation headers when v2 is introduced
4. **Structured logging** — Replace `console.error` with Pino or Winston with request ID correlation
5. **Database migration strategy** — Use Prisma Migrate instead of `db push` for production schema changes
6. **CI/CD pipeline** — Add GitHub Actions for lint, type-check, test, build on PR
7. **Monitoring** — Add health check endpoint enhancements (DB connectivity, response times) and uptime monitoring
8. **React Query adoption** — Replace raw fetch with TanStack Query for automatic caching, refetching, and optimistic updates

---

## 7. TEST COVERAGE GAPS

- No unit tests for business logic (availability service, notification service)
- No frontend component tests
- No E2E tests (Playwright/Cypress)
- No load/stress testing
- Integration tests only cover basic API scenarios in `tests/api.test.ts`

