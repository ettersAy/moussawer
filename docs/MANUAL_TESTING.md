# Manual Testing Guide

Start from a clean seeded database:

```bash
npm run db:reset
npm run dev
```

## Guest Flow

1. Open `http://localhost:5173`.
2. Search from the landing page by location, for example `Toronto`.
3. Open a photographer profile.
4. View services, portfolio, reviews, and availability.
5. Open Support and submit a support request.

## Client Flow

1. Log in as `client@example.com / password`.
2. Go to Discover and filter by `Portrait` or `Toronto`.
3. Open Amir Haddad.
4. Pick a service, date, and available slot.
5. Create a booking request.
6. Open Dashboard and confirm the booking appears.
7. Open Messages and send a message.
8. Open Cases and create one incident and one dispute.
9. Save a photographer from the profile page.

## Photographer Flow

1. Log in as `photographer-one@example.com / password`.
2. Open Dashboard.
3. Confirm a pending booking.
4. Complete a confirmed booking.
5. Add a service from the photographer workspace.
6. Open Messages and reply to a conversation.
7. Use API docs to test `POST /me/availability` and `POST /portfolio`.

## Admin Flow

1. Log in as `admin@example.com / password`.
2. Open the **Admin** nav link (Shield icon) visible at the top — this routes to `/admin`.
3. **Overview tab**: Verify platform metrics (users, photographers, bookings, open cases).
4. **Users tab**: View all users, toggle a user between Active/Suspended.
5. **Incidents tab**: Review incidents, advance them through OPEN → UNDER_REVIEW → RESOLVED/CLOSED.
6. **Disputes tab**: Review disputes, advance through OPEN → UNDER_REVIEW → RESOLVED/REJECTED.
7. **Categories tab**: Create a new category (e.g. "Real Estate").
8. **Activity tab**: View audit log timeline with actor, action, entity, and metadata.
9. Confirm non-admin accounts (e.g. `client@example.com`) are redirected to `/dashboard` when visiting `/admin`.
10. Confirm the Admin nav link is invisible for non-admin users.

## Full Booking Lifecycle

1. Client creates a pending booking from a profile slot.
2. Photographer confirms the booking.
3. Photographer completes the booking.
4. Client submits a review with `POST /reviews` or the API docs.
5. Try reviewing a pending booking and confirm `422`.

## Calendar Conflict Flow

1. Client books an available slot.
2. Try to book the same slot again.
3. Confirm the API returns `409 BOOKING_CONFLICT`.
4. Try to book a past time through the API.
5. Confirm the API returns `422 VALIDATION_ERROR`.

## Messaging Flow

1. Client creates a booking with notes.
2. Open Messages as the client and send a message.
3. Log in as the photographer and read/reply.
4. Verify the conversation read endpoint returns a timestamp.
