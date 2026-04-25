# API Notes

Base URL:

```txt
/api/v1
```

Interactive docs:

```txt
http://localhost:4000/api-docs
```

Raw OpenAPI:

```txt
http://localhost:4000/api/v1/openapi.json
```

## Response Shape

Success:

```json
{ "data": {} }
```

Paginated success:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "totalPages": 1
  }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {}
  }
}
```

## Auth

Send JWT tokens as:

```txt
Authorization: Bearer <token>
```

Main endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `PATCH /me`

## Core Endpoint Groups

- Discovery: `GET /categories`, `GET /photographers`, `GET /photographers/:identifier`
- Calendar: `GET /photographers/:identifier/availability`, `GET/POST/DELETE /me/availability`, `POST /me/calendar-blocks`
- Bookings: `GET /bookings`, `POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status`
- Messaging: `GET/POST /conversations`, `GET/POST /conversations/:id/messages`, `PATCH /conversations/:id/read`
- Incidents: `GET/POST /incidents`, `PATCH /admin/incidents/:id`
- Disputes: `GET/POST /disputes`, `GET/POST /disputes/:id/comments`, `PATCH /admin/disputes/:id`
- Portfolio: `GET/POST /portfolio`, `PATCH/DELETE /portfolio/:id`
- Reviews: `GET /photographers/:identifier/reviews`, `POST /reviews`
- Notifications: `GET /notifications`, `PATCH /notifications/:id/read`
- Admin: `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id`, `POST /admin/categories`, `GET /admin/activity`

## Booking Conflict Contract

- Past booking date: `422 VALIDATION_ERROR`
- Slot outside photographer availability: `409 SLOT_UNAVAILABLE`
- Calendar block overlap: `409 SLOT_UNAVAILABLE`
- Existing pending/confirmed booking overlap: `409 BOOKING_CONFLICT`
- Invalid lifecycle transition: `422 INVALID_STATUS_TRANSITION`
