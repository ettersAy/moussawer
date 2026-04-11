# PHASE2-003: Bookings System - Manual Verification Guide

## Overview

This document provides comprehensive manual testing procedures for the new bookings system added in PHASE2-003. This is the core marketplace feature allowing clients to book photographers.

**Endpoints Summary:**
| Method | Route | Role | Purpose |
|--------|-------|------|---------|
| POST | `/api/bookings` | Client | Create booking |
| GET | `/api/bookings` | Client/Photographer | List own bookings |
| GET | `/api/bookings/{id}` | Client/Photographer | View booking details |
| PATCH | `/api/bookings/{id}/status` | Photographer | Update booking status |
| DELETE | `/api/bookings/{id}` | Client | Delete pending booking |

---

## Prerequisites

1. Start the Laravel Sail environment:
   ```bash
   ./vendor/bin/sail up -d
   ```

2. Ensure database is fresh:
   ```bash
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```

3. Create test users (if not seeded):
   ```bash
   ./vendor/bin/sail artisan tinker
   
   // Create client user
   $clientUser = User::create([
       'name' => 'Alice Client',
       'email' => 'client@test.com',
       'password' => bcrypt('password'),
       'role' => UserRole::Client,
   ]);
   
   // Create photographer user
   $photographerUser = User::create([
       'name' => 'Bob Photographer',
       'email' => 'photographer@test.com',
       'password' => bcrypt('password'),
       'role' => UserRole::Photographer,
   ]);
   
   // Create photographer profile
   $photographer = Photographer::create([
       'user_id' => $photographerUser->id,
       'hourly_rate' => 150.00,
       'availability_status' => 'available',
   ]);
   
   exit
   ```

4. Get authentication tokens:
   ```bash
   # Login client
   curl -X POST http://localhost/api/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "client@test.com",
       "password": "password"
     }' | jq .
   
   # Login photographer
   curl -X POST http://localhost/api/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "photographer@test.com",
       "password": "password"
     }' | jq .
   ```

   **Save the tokens:**
   ```bash
   CLIENT_TOKEN="client_token_here"
   PHOTO_TOKEN="photographer_token_here"
   ```

---

## Booking Workflow Tests

### 1. Create Booking (Client Only)

**Success Case - Valid Booking:**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00",
    "notes": "Family portrait session"
  }' | jq .
```

**Expected Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "client_id": 1,
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00.000000Z",
    "status": "pending",
    "notes": "Family portrait session",
    "created_at": "2026-04-11T10:30:00.000000Z",
    "updated_at": "2026-04-11T10:30:00.000000Z",
    "client": {
      "id": 1,
      "name": "Alice Client",
      "email": "client@test.com"
    },
    "photographer": {
      "id": 1,
      "hourly_rate": 150,
      "availability_status": "available",
      "user": {
        "id": 2,
        "name": "Bob Photographer",
        "email": "photographer@test.com"
      }
    }
  }
}
```

**Non-Client Cannot Create (403 Forbidden):**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00",
    "notes": "Try to book as photographer"
  }' | jq .
```

Expected 403.

**Unauthenticated Cannot Create (401 Unauthorized):**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00"
  }' | jq .
```

Expected 401.

### 2. Availability Check

**Cannot Book Unavailable Photographer (409 Conflict):**
```bash
# Update photographer to unavailable
./vendor/bin/sail artisan tinker
$photographer = Photographer::find(1);
$photographer->update(['availability_status' => 'booked']);
exit

# Try to create booking
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00",
    "notes": "Photographer unavailable"
  }' | jq .
```

Expected 409 with message "Photographer is not available for booking."

**Restore photographer availability:**
```bash
./vendor/bin/sail artisan tinker
$photographer = Photographer::find(1);
$photographer->update(['availability_status' => 'available']);
exit
```

### 3. Date Validation

**Cannot Book Past Date (422 Unprocessable Entity):**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-01-01T14:00:00",
    "notes": "Past date"
  }' | jq .
```

Expected 422 with validation error for scheduled_date.

**Valid Future Dates:**
- Next week, next month, next year all valid
- Must be in future (> now())

### 4. Photographer ID Validation

**Invalid Photographer ID (422 Validation Error):**
```bash
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 9999,
    "scheduled_date": "2026-05-15T14:00:00"
  }' | jq .
```

Expected 422 with validation error for photographer_id.

---

## List Bookings Tests

### 1. Client Lists Their Bookings

```bash
curl -X GET http://localhost/api/bookings \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

**Expected Response (200 OK):**
- Only bookings where `client_id` matches authenticated user
- Paginated (15 per page)
- Each booking includes client, photographer, and user relationships

### 2. Photographer Lists Their Bookings

```bash
curl -X GET http://localhost/api/bookings \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

**Expected Response (200 OK):**
- Only bookings where `photographer_id` matches photographer's record
- Same pagination as client

### 3. Filter by Status

```bash
# Get pending bookings only
curl -X GET "http://localhost/api/bookings?status=pending" \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .

# Get confirmed bookings only
curl -X GET "http://localhost/api/bookings?status=confirmed" \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

Expected: Returns only bookings with specified status.

### 4. Pagination

```bash
# Request page 2 with 10 items
curl -X GET "http://localhost/api/bookings?page=2&per_page=10" \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected: Response includes pagination metadata (current_page, total, etc.).

---

## View Booking Details Test

### 1. Client Views Their Booking

```bash
curl -X GET http://localhost/api/bookings/1 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

**Expected Response (200 OK):** Full booking details including:
- Client name, email
- Photographer info with hourly rate
- Scheduled date, status, notes

### 2. Photographer Views Their Booking

```bash
curl -X GET http://localhost/api/bookings/1 \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

Expected 200 - Photographer can view.

### 3. Cannot View Other's Booking (403 Forbidden)

```bash
# Client tries to view another client's booking
curl -X GET http://localhost/api/bookings/2 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 403 if booking belongs to different client.

### 4. Non-existent Booking (404 Not Found)

```bash
curl -X GET http://localhost/api/bookings/9999 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 404.

---

## Update Booking Status Tests

### 1. Photographer Confirms Pending Booking

```bash
# Create pending booking first
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-05-15T14:00:00"
  }' | jq -r '.data.id' > booking_id.txt

BOOKING_ID=$(cat booking_id.txt)

# Photographer confirms
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{"status": "confirmed"}' | jq .
```

**Expected Response (200 OK):**
```json
{
  "data": {
    ...
    "status": "confirmed",
    ...
  }
}
```

### 2. Photographer Completes Confirmed Booking

```bash
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{"status": "completed"}' | jq .
```

Expected 200 with status updated to "completed".

### 3. Photographer Cancels Pending Booking

```bash
# Create another pending booking
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-06-15T14:00:00"
  }' | jq -r '.data.id' > booking_id2.txt

BOOKING_ID2=$(cat booking_id2.txt)

# Cancel it
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID2/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{"status": "cancelled"}' | jq .
```

Expected 200 with status updated to "cancelled".

### 4. Invalid Status Transitions (422)

**Cannot go backwards in workflow:**
```bash
# Try to transition from completed back to confirmed
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{"status": "pending"}' | jq .
```

Expected 422 with message about invalid transition.

**Valid transitions:**
- pending → confirmed, cancelled
- confirmed → completed, cancelled
- completed → (no valid transitions)
- cancelled → (no valid transitions)

### 5. Client Cannot Update Status (403 Forbidden)

```bash
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{"status": "confirmed"}' | jq .
```

Expected 403.

### 6. Invalid Status Value (422)

```bash
curl -X PATCH http://localhost/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{"status": "invalid_status"}' | jq .
```

Expected 422 with validation error.

---

## Delete Booking Tests

### 1. Client Deletes Pending Booking

```bash
# Create pending booking
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-07-15T14:00:00"
  }' | jq -r '.data.id' > booking_id3.txt

BOOKING_ID3=$(cat booking_id3.txt)

# Delete it
curl -X DELETE http://localhost/api/bookings/$BOOKING_ID3 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

**Expected Response (204 No Content):** Empty response, booking is deleted.

Verify deletion:
```bash
curl -X GET http://localhost/api/bookings/$BOOKING_ID3 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 404.

### 2. Cannot Delete Confirmed Booking (403 Forbidden)

```bash
# Try to delete confirmed booking
curl -X DELETE http://localhost/api/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 403 with message.

### 3. Photographer Cannot Delete (403 Forbidden)

```bash
# Create new pending booking
curl -X POST http://localhost/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "photographer_id": 1,
    "scheduled_date": "2026-08-15T14:00:00"
  }' | jq -r '.data.id' > booking_id4.txt

BOOKING_ID4=$(cat booking_id4.txt)

# Photographer tries to delete
curl -X DELETE http://localhost/api/bookings/$BOOKING_ID4 \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

Expected 403.

---

## Response Format Verification

### Booking Resource Structure

Each booking response should include:
- `id` (integer)
- `client_id` (integer)
- `photographer_id` (integer)
- `scheduled_date` (ISO 8601 datetime)
- `status` (enum: "pending", "confirmed", "completed", "cancelled")
- `notes` (string, nullable)
- `created_at` (ISO 8601 timestamp)
- `updated_at` (ISO 8601 timestamp)
- `client` (nested object with id, name, email)
- `photographer` (nested object with id, hourly_rate, availability_status, user)

### Relationships in Response

```bash
curl -X GET http://localhost/api/bookings/1 \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data | keys'
```

Should show all nested relationships properly loaded.

---

## Database Verification

Verify bookings table and data:

```bash
./vendor/bin/sail artisan tinker

# Check all bookings
Booking::all();

# Check bookings by status
Booking::where('status', 'pending')->get();

# Check client bookings
Booking::where('client_id', 1)->with('client', 'photographer.user')->get();

# Check photographer bookings
Booking::where('photographer_id', 1)->get();

exit
```

---

## Authorization Matrix

| Action | Client | Photographer | Admin | Notes |
|--------|--------|--------------|-------|-------|
| Create Booking | ✅ Own | ❌ 403 | ❌ N/A | Clients only |
| View Booking | ✅ Own | ✅ Own | ✅ | Role-based access |
| List Bookings | ✅ Own | ✅ Own | ✅ All | Filtered by role |
| Update Status | ❌ 403 | ✅ Own | ✅ | Photographers only |
| Delete Booking | ✅ *Pending Only | ❌ 403 | ✅ | *Must be pending |

---

## Error Handling

### 400-Level Errors

| Error | Status | When | Message |
|-------|--------|------|---------|
| Validation Error | 422 | Invalid input (date, photographer_id) | Field-specific errors |
| Availability Error | 409 | Photographer not available | "Photographer is not available for booking." |
| Auth Error | 401 | No token | Standard auth error |
| Forbidden | 403 | Insufficient permissions | Role/ownership check failed |
| Not Found | 404 | Booking doesn't exist | Standard 404 message |
| Invalid Transition | 422 | Status transition not allowed | "Cannot transition from X to Y." |

---

## Automated Test Commands

```bash
# All booking tests
./vendor/bin/sail artisan test tests/Feature/Booking/BookingTest.php

# Specific test
./vendor/bin/sail artisan test tests/Feature/Booking/BookingTest.php --filter=test_client_can_create_booking

# Full test suite
./vendor/bin/sail artisan test --compact

# E2E tests
npm run test:e2e
```

---

## Test Results Summary

**Booking Tests:** 23/23 passing
- ✅ Create (client only, availability check, date validation)
- ✅ List (by role, with filters)
- ✅ View (authorization checks)
- ✅ Update Status (transitions, authorization)
- ✅ Delete (pending only, authorization)
- ✅ Response formats & relationships

**Backend Tests:** 136/136 total passing

**E2E Tests:** 29/29 passing (registration and contact forms unaffected)

---

## Known Limitations

- No email notifications yet (future enhancement)
- No calendar blocking (future enhancement)
- No review/rating system (separate ticket)
- Admin panel not yet implemented

---

## Next Steps

- Implement booking notifications (email/in-app)
- Add calendar view component
- Implement review/rating system
- Create booking management dashboard
