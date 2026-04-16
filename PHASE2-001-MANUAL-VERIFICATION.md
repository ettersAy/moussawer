# PHASE2-001: Photographer & Client Profile Management - Manual Verification Guide

## Overview

This document provides comprehensive manual testing procedures for the new photographer and client profile management endpoints added in PHASE2-001.

**Endpoints Summary:**
| Method | Route | Role | Purpose |
|--------|-------|------|---------|
| POST | `/api/photographer/profile` | Photographer | Create profile |
| GET | `/api/photographer/profile` | Photographer | Fetch profile |
| PUT | `/api/photographer/profile` | Photographer | Update profile |
| DELETE | `/api/photographer/profile` | Photographer | Delete profile |
| POST | `/api/client/profile` | Client | Create profile |
| GET | `/api/client/profile` | Client | Fetch profile |
| PUT | `/api/client/profile` | Client | Update profile |
| DELETE | `/api/client/profile` | Client | Delete profile |

---

## Prerequisites

1. Start the Laravel Sail environment:
   ```bash
   ./vendor/bin/sail up -d
   ```

2. Ensure database is fresh (optional, for clean testing):
   ```bash
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```

3. Create test users:
   ```bash
   ./vendor/bin/sail artisan tinker
   
   // Create photographer user
   $photographerUser = User::create([
       'name' => 'John Photographer',
       'email' => 'photographer@test.com',
       'password' => bcrypt('password'),
       'role' => UserRole::Photographer,
   ]);
   
   // Create client user
   $clientUser = User::create([
       'name' => 'Jane Client',
       'email' => 'client@test.com',
       'password' => bcrypt('password'),
       'role' => UserRole::Client,
   ]);
   
   exit
   ```

4. Get authentication tokens:
   ```bash
   # Login photographer
   curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "photographer@test.com",
       "password": "password"
     }' | jq .
   
   # Login client
   curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "client@test.com",
       "password": "password"
     }' | jq .
   ```
   
   **Save the tokens** for use in test requests. Store them in variables:
   ```bash
   PHOTO_TOKEN="photographer_token_here"
   CLIENT_TOKEN="client_token_here"
   ```

---

## Photographer Profile Tests

### 1. Create Photographer Profile

**Success Case:**
```bash
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "bio": "Professional in landscape and portrait photography",
    "portfolio_url": "https://portfolio.example.com",
    "hourly_rate": 150.00,
    "availability_status": "available"
  }' | jq .
```

**Expected Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Professional in landscape and portrait photography",
    "portfolio_url": "https://portfolio.example.com",
    "hourly_rate": 150,
    "availability_status": "available",
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T10:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Photographer",
      "email": "photographer@test.com"
    }
  }
}
```

**Validation Errors:**

Missing hourly_rate:
```bash
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "bio": "Some bio",
    "availability_status": "available"
  }' | jq .
```

Expected 422 with `errors.hourly_rate` field.

Invalid portfolio_url (not a valid URL):
```bash
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "bio": "Some bio",
    "portfolio_url": "not-a-url",
    "hourly_rate": 150,
    "availability_status": "available"
  }' | jq .
```

Expected 422 with `errors.portfolio_url` field.

### 2. Duplicate Profile Prevention

```bash
# Second attempt to create profile
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "bio": "Another bio",
    "hourly_rate": 200,
    "availability_status": "available"
  }' | jq .
```

**Expected Response (409 Conflict):**
```json
{
  "message": "Profile already exists for this user"
}
```

### 3. Fetch Photographer Profile

```bash
curl -X GET http://localhost/api/photographer/profile \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

**Expected Response (200 OK):** Same structure as create response.

**Non-existent Profile (before creation):**
```bash
# Using token of photographer with no profile
curl -X GET http://localhost/api/photographer/profile \
  -H "Authorization: Bearer $NEW_PHOTO_TOKEN" | jq .
```

Expected 404 with message.

### 4. Update Photographer Profile

**Full Update:**
```bash
curl -X PUT http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "bio": "Updated bio",
    "portfolio_url": "https://newportfolio.example.com",
    "hourly_rate": 175,
    "availability_status": "booked"
  }' | jq .
```

**Partial Update (only some fields):**
```bash
# Only update hourly_rate
curl -X PUT http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "hourly_rate": 200
  }' | jq .
```

Expected 200 with all fields (unchanged ones preserved).

### 5. Delete Photographer Profile

```bash
curl -X DELETE http://localhost/api/photographer/profile \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

**Expected Response (204 No Content):** Empty response.

Verify deletion (should return 404):
```bash
curl -X GET http://localhost/api/photographer/profile \
  -H "Authorization: Bearer $PHOTO_TOKEN" | jq .
```

---

## Client Profile Tests

### 1. Create Client Profile

**Success Case:**
```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "phone": "+14155552671",
    "address": "123 Main Street, Apt 4B",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "email"
  }' | jq .
```

**Expected Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "user_id": 2,
    "phone": "+14155552671",
    "address": "123 Main Street, Apt 4B",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "email",
    "created_at": "2025-01-15T10:35:00.000000Z",
    "updated_at": "2025-01-15T10:35:00.000000Z",
    "user": {
      "id": 2,
      "name": "Jane Client",
      "email": "client@test.com"
    }
  }
}
```

### 2. Validation Tests - Client Phone

**Invalid Phone (not E.164 format):**
```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "phone": "not-a-phone",
    "address": "123 Main Street",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "email"
  }' | jq .
```

Expected 422 with `errors.phone` field.

**Missing Phone:**
```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "address": "123 Main Street",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "email"
  }' | jq .
```

Expected 422 with `errors.phone` field.

### 3. Validation Tests - Postal Code

**Invalid Canadian Postal Code:**
```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "phone": "+14155552671",
    "address": "123 Main Street",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "INVALID",
    "preferred_contact": "email"
  }' | jq .
```

Expected 422 with `errors.postal_code` field.

**Valid Canadian Postal Codes (should succeed):**
- `H1H 1H1` (with space)
- `H1H1H1` (without space)

### 4. Validation Tests - Preferred Contact

**Invalid Contact Method:**
```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "phone": "+14155552671",
    "address": "123 Main Street",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "telegram"
  }' | jq .
```

Expected 422 with `errors.preferred_contact` field.

**Valid Contact Methods:** `email`, `phone`, `sms`

### 5. Fetch Client Profile

```bash
curl -X GET http://localhost/api/client/profile \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 200 with profile data.

### 6. Update Client Profile

**Full Update:**
```bash
curl -X PUT http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "phone": "+14155552672",
    "address": "456 Oak Avenue",
    "city": "Toronto",
    "province": "ON",
    "postal_code": "M5V 3A8",
    "preferred_contact": "phone"
  }' | jq .
```

**Partial Update:**
```bash
curl -X PUT http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "preferred_contact": "sms"
  }' | jq .
```

All other fields should remain unchanged.

### 7. Delete Client Profile

```bash
curl -X DELETE http://localhost/api/client/profile \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .
```

Expected 204 No Content.

---

## Authorization & Access Control Tests

### 1. Non-Photographer Cannot Create Photographer Profile

```bash
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "bio": "Trying to create photographer profile",
    "hourly_rate": 100,
    "availability_status": "available"
  }' | jq .
```

Expected 403 Forbidden.

### 2. Non-Client Cannot Create Client Profile

```bash
curl -X POST http://localhost/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "phone": "+14155552671",
    "address": "123 Main Street",
    "city": "Montreal",
    "province": "QC",
    "postal_code": "H1H 1H1",
    "preferred_contact": "email"
  }' | jq .
```

Expected 403 Forbidden.

### 3. Unauthenticated Request

```bash
curl -X GET http://localhost/api/photographer/profile | jq .
```

Expected 401 Unauthorized.

### 4. Duplicate Profile Prevention

First photographer creates profile (201), second attempt returns 409:
```bash
# First attempt - succeeds
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "hourly_rate": 150,
    "availability_status": "available"
  }' | jq .

# Second attempt - fails with 409
curl -X POST http://localhost/api/photographer/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PHOTO_TOKEN" \
  -d '{
    "hourly_rate": 200,
    "availability_status": "available"
  }' | jq .
```

---

## Response Format Verification

### Photographer Profile Resource

Should include:
- `id` (integer)
- `user_id` (integer)
- `bio` (string, nullable)
- `portfolio_url` (string, nullable)
- `hourly_rate` (integer/float)
- `availability_status` (enum string)
- `created_at` (ISO 8601 timestamp)
- `updated_at` (ISO 8601 timestamp)
- `user` (nested user object with id, name, email)

### Client Profile Resource

Should include:
- `id` (integer)
- `user_id` (integer)
- `phone` (E.164 formatted string)
- `address` (string)
- `city` (string)
- `province` (string)
- `postal_code` (Canadian postal code string)
- `preferred_contact` (enum string: email/phone/sms)
- `created_at` (ISO 8601 timestamp)
- `updated_at` (ISO 8601 timestamp)
- `user` (nested user object)

---

## Test Results Checklist

- [ ] Photographer profile creation succeeds with 201 status
- [ ] Photographer profile validation prevents invalid data
- [ ] Photographer profile duplicate prevention returns 409
- [ ] Photographer can fetch own profile (200)
- [ ] Photographer can fetch non-existent profile returns 404
- [ ] Photographer can update full profile
- [ ] Photographer can update partial profile
- [ ] Photographer can delete profile (204)
- [ ] Client profile creation succeeds with 201 status
- [ ] Client phone validation enforces E.164 format
- [ ] Client postal code validation enforces Canadian format
- [ ] Client preferred_contact validation enforces enum
- [ ] Client can fetch own profile (200)
- [ ] Client can update full and partial profile
- [ ] Client can delete profile (204)
- [ ] Non-photographer cannot access photographer endpoints (403)
- [ ] Non-client cannot access client endpoints (403)
- [ ] Unauthenticated requests return 401
- [ ] All responses include proper user relationship data
- [ ] HTTP status codes match specification

---

## Database Verification

To verify database entries after testing:

```bash
./vendor/bin/sail artisan tinker

# Check photographers table
Photographer::all();

# Check clients table
Client::all();

# Check relationships
$photographer = Photographer::first();
$photographer->user; // Should return the User object

$client = Client::first();
$client->user; // Should return the User object

exit
```

---

## Troubleshooting

### "Profile already exists for this user"

The photographer/client already has a profile. Delete it first or use a different user.

### "The hourly rate field must be at least 0.01"

Hourly rate must be positive and at least 0.01. Use valid decimal values.

### "The phone field format is invalid"

Phone must be in E.164 format (e.g., `+14155552671`). Can include leading `+` and country code.

### "The postal code field format is invalid"

Canadian postal codes must be `A1A 1A1` or `A1A1A1` format (letter-digit-letter space/dash digit-letter-digit).

### "The preferred contact method field is not included in the list: email, phone, sms"

Only these three values are allowed: `email`, `phone`, or `sms`.

---

## Automated Test Commands

Run all profile tests:
```bash
./vendor/bin/sail artisan test tests/Feature/Photographer/ProfileTest.php tests/Feature/Client/ProfileTest.php
```

Run only photographer tests:
```bash
./vendor/bin/sail artisan test tests/Feature/Photographer/ProfileTest.php
```

Run only client tests:
```bash
./vendor/bin/sail artisan test tests/Feature/Client/ProfileTest.php
```

Run full test suite:
```bash
./vendor/bin/sail artisan test --compact
```

---

## E2E Testing

E2E tests for profile management can be added to the `e2e/` directory. Current E2E tests (registration and contact form) remain unaffected by this feature and should continue to pass.

Verify E2E tests:
```bash
npm run test:e2e
```

Expected: 29/29 tests passing.
