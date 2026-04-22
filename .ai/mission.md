# Test the "Booking Process" for all roles

## Mission-ID: 0032-Booking-Process-All-Roles

## Task Overview
First create new user for each role:
- admin001@moussawer.ai
- photographe001@moussawer.ai
- client001@moussawer.ai

Then test the complete booking process across all three roles (Client, Photographer, Admin) to ensure the booking lifecycle works end-to-end. This includes creating booking requests, managing booking statuses, listing/filtering bookings, and enforcing role-based access control.

## System Architecture Overview

### Backend API Endpoints (all under `/api`, auth:sanctum)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/api/bookings` | `BookingController@store` | Create booking (client only) |
| POST | `/api/client/bookings` | `BookingRequestController@store` | Create booking with service (client only) |
| GET | `/api/bookings` | `BookingController@index` | List bookings (role-filtered) |
| GET | `/api/bookings/{booking}` | `BookingController@show` | View single booking |
| PATCH | `/api/bookings/{booking}/status` | `BookingController@updateStatus` | Update booking status |
| DELETE | `/api/bookings/{booking}` | `BookingController@destroy` | Delete booking |

### Frontend Routes

| Path | Name | Role | View |
|------|------|------|------|
| `/client/bookings` | `client-bookings` | Client | `BookingsView.vue` |
| `/photographers/{id}/book` | `client-booking-request` | Client | `BookingRequestView.vue` |
| `/photographer/bookings` | `photographer-bookings` | Photographer | `BookingsView.vue` |

### Booking Status Lifecycle
```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
completed → (terminal)
cancelled → (terminal)
```

### Authorization Rules (BookingPolicy)

| Action | Client | Photographer | Admin |
|--------|--------|-------------|-------|
| Create booking | ✅ Own only | ❌ | ❌ |
| List bookings | ✅ Own only | ✅ Assigned only | ✅ All |
| View booking | ✅ Own only | ✅ Assigned only | ✅ All |
| Update status | ❌ | ✅ Assigned only | ✅ All |
| Delete booking | ✅ Pending only | ❌ | ✅ All |

### Database Schema (`bookings` table)

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| client_id | bigint unsigned | FK → users(id) |
| photographer_id | bigint unsigned | FK → photographers(id) |
| photographer_service_id | bigint unsigned | FK → photographer_services(id), nullable |
| scheduled_date | datetime | Must be in the future |
| location | varchar(255) | Nullable |
| status | enum('pending','confirmed','completed','cancelled') | Default: 'pending' |
| notes | longtext | Nullable |

### Key Files

**Backend:**
- `app/Http/Controllers/Api/Booking/BookingController.php` — Main CRUD controller
- `app/Http/Controllers/Api/Client/BookingRequestController.php` — Client booking request with service
- `app/Services/BookingService.php` — Booking creation service
- `app/Models/Booking.php` — Eloquent model
- `app/Policies/BookingPolicy.php` — Authorization policy
- `app/Http/Resources/BookingResource.php` — JSON resource transformer
- `app/Http/Requests/Booking/StoreBookingRequest.php` — Validation for booking creation
- `app/Http/Requests/Booking/UpdateBookingStatusRequest.php` — Validation for status updates
- `app/Http/Requests/Client/StoreBookingRequest.php` — Validation for client booking requests

**Frontend:**
- `resources/js/views/client/BookingRequestView.vue` — Booking request form page
- `resources/js/views/client/BookingsView.vue` — Client's bookings list
- `resources/js/views/photographer/BookingsView.vue` — Photographer's bookings management
- `resources/js/components/client/booking/ServiceSelector.vue` — Service selection grid
- `resources/js/components/client/booking/SchedulePicker.vue` — Date/time picker
- `resources/js/components/client/booking/EventDetailsForm.vue` — Location/notes form
- `resources/js/components/client/booking/BookingSummary.vue` — Summary sidebar with submit
- `resources/js/components/shared/BookingsTable.vue` — Shared table with role-based actions
- `resources/js/components/shared/BookingFilters.vue` — Shared filter component
- `resources/js/components/client/BookingsList.vue` — Client booking cards
- `resources/js/components/photographer/BookingsList.vue` — Photographer booking cards
- `resources/js/composables/useBookingForm.js` — Booking form composable
- `resources/js/composables/useBookings.js` — Bookings list composable

**Tests:**
- `tests/Feature/Booking/BookingTest.php` — Feature tests for booking CRUD (413 lines)
- `tests/Feature/Api/Client/BookingRequestTest.php` — Feature tests for client booking requests (78 lines)
- `tests/Unit/Models/BookingTest.php` — Unit tests for Booking model (87 lines)

---

## Explicit Requirements

### 1. User Creation & Setup

#### 1.1 Create Test Users
- [ ] **Create admin001@moussawer.ai**: User with `role = admin`
- [ ] **Create photographe001@moussawer.ai**: User with `role = photographer`
- [ ] **Create client001@moussawer.ai**: User with `role = client`
- [ ] **Set passwords**: All users should have password `password`
- [ ] **Complete photographer profile**: For photographe001, create photographer profile with bio, hourly_rate, portfolio_url, availability_status = 'available'
- [ ] **Add photographer services**: Create at least 2 services for photographe001 (e.g., "Wedding Photography" at $200/hr, "Portrait Session" at $150/hr)
- [ ] **Complete client profile**: For client001, create client profile (phone, address, etc.)

#### 1.2 Verify User Creation
- [ ] **Verify database records**: Check users, photographers, photographer_services tables
- [ ] **Test login**: Verify all three users can login via `POST /api/login`
- [ ] **Test authentication**: Verify token-based access works for all three users

### 2. Backend API Verification — Client Role

#### 2.1 Create Booking (POST /api/bookings)
- [ ] **Login as client001**: Authenticate and get Sanctum token
- [ ] **Create booking**: `POST /api/bookings` with valid `photographer_id`, `scheduled_date` (future), `notes`
- [ ] **Verify response**: Returns 201 with booking data including `status: 'pending'`, `client_id`, `photographer_id`
- [ ] **Verify database**: Booking record exists in `bookings` table with correct data
- [ ] **Test validation — missing fields**: Returns 422 with validation errors
- [ ] **Test validation — past date**: Returns 422 with `scheduled_date` validation error
- [ ] **Test validation — invalid photographer_id**: Returns 422
- [ ] **Test unavailable photographer**: Set photographer to `booked` → Returns 409 "Photographer is not available for booking"
- [ ] **Test unauthenticated**: Returns 401

#### 2.2 Create Booking with Service (POST /api/client/bookings)
- [ ] **Create booking with service**: `POST /api/client/bookings` with `photographer_id`, `photographer_service_id`, `scheduled_date`, `location`, `notes`
- [ ] **Verify response**: Returns 201 with `status: 'pending'`, `location`, `photographer_service_id`
- [ ] **Verify database**: Booking record includes `photographer_service_id` and `location`
- [ ] **Test validation — missing required fields**: Returns 422 for missing `photographer_id`, `photographer_service_id`, `scheduled_date`, `location`
- [ ] **Test validation — past date**: Returns 422

#### 2.3 List Bookings (GET /api/bookings)
- [ ] **Login as client001**: Authenticate
- [ ] **List own bookings**: Returns 200 with only client001's bookings
- [ ] **Filter by status**: `?status=pending` returns only pending bookings
- [ ] **Pagination**: Response includes pagination metadata
- [ ] **Sorting**: `?sort_by=scheduled_date&sort_direction=asc` works correctly
- [ ] **Empty state**: Returns empty `data` array when no bookings exist

#### 2.4 View Booking (GET /api/bookings/{booking})
- [ ] **View own booking**: Returns 200 with full booking details
- [ ] **Verify relationships**: Response includes `client` and `photographer` nested data
- [ ] **View other client's booking**: Returns 403 Forbidden
- [ ] **View non-existent booking**: Returns 404

#### 2.5 Delete Booking (DELETE /api/bookings/{booking})
- [ ] **Delete own pending booking**: Returns 204, record removed from database
- [ ] **Delete confirmed booking**: Returns 403 (cannot delete confirmed bookings)
- [ ] **Delete other's booking**: Returns 403
- [ ] **Delete non-existent booking**: Returns 404

#### 2.6 Cannot Update Status
- [ ] **Client cannot update status**: `PATCH /api/bookings/{id}/status` with `status: 'confirmed'` → Returns 403

### 3. Backend API Verification — Photographer Role

#### 3.1 List Bookings (GET /api/bookings)
- [ ] **Login as photographe001**: Authenticate
- [ ] **List assigned bookings**: Returns 200 with only bookings assigned to this photographer
- [ ] **Filter by status**: `?status=pending` works correctly
- [ ] **Empty state**: Returns empty `data` array when no bookings assigned

#### 3.2 View Booking (GET /api/bookings/{booking})
- [ ] **View own assigned booking**: Returns 200
- [ ] **View other photographer's booking**: Returns 403
- [ ] **View non-existent booking**: Returns 404

#### 3.3 Update Booking Status (PATCH /api/bookings/{booking}/status)
- [ ] **Confirm pending booking**: `status: 'confirmed'` → Returns 200, status changes to 'confirmed'
- [ ] **Complete confirmed booking**: `status: 'completed'` → Returns 200, status changes to 'completed'
- [ ] **Cancel pending booking**: `status: 'cancelled'` → Returns 200, status changes to 'cancelled'
- [ ] **Cancel confirmed booking**: `status: 'cancelled'` → Returns 200, status changes to 'cancelled'
- [ ] **Invalid transition — completed → pending**: Returns 422 "Cannot transition from completed to pending"
- [ ] **Invalid transition — cancelled → confirmed**: Returns 422
- [ ] **Invalid transition — pending → completed**: Returns 422 (must go through confirmed first)
- [ ] **Invalid status value**: Returns 422 validation error
- [ ] **Update other photographer's booking**: Returns 403
- [ ] **Update non-existent booking**: Returns 404

#### 3.4 Cannot Delete Booking
- [ ] **Photographer cannot delete**: `DELETE /api/bookings/{id}` → Returns 403

### 4. Backend API Verification — Admin Role

#### 4.1 List All Bookings (GET /api/bookings)
- [ ] **Login as admin001**: Authenticate
- [ ] **List all bookings**: Returns 200 with ALL bookings (not filtered by role)
- [ ] **Filter by status**: `?status=pending` works
- [ ] **Filter by client**: If supported, verify filtering
- [ ] **Pagination**: Works correctly

#### 4.2 View Any Booking (GET /api/bookings/{booking})
- [ ] **View any booking**: Returns 200 regardless of client/photographer
- [ ] **View non-existent booking**: Returns 404

#### 4.3 Update Booking Status (PATCH /api/bookings/{booking}/status)
- [ ] **Admin can update any booking status**: Confirm pending → confirmed → completed
- [ ] **Admin can cancel any booking**: pending → cancelled, confirmed → cancelled
- [ ] **Invalid transitions**: Returns 422

#### 4.4 Delete Any Booking (DELETE /api/bookings/{booking})
- [ ] **Admin can delete any booking**: Returns 204 regardless of status
- [ ] **Delete non-existent booking**: Returns 404

### 5. Frontend UI Verification — Client Role

#### 5.1 Booking Request Page (`/photographers/{id}/book`)
- [ ] **Navigate to booking page**: Login as client001, navigate to `/photographers/{id}/book`
- [ ] **Verify page loads**: No console errors, photographer name displayed
- [ ] **Verify UI elements**:
  - Page title "Book {photographer name}"
  - ServiceSelector component with photographer's services
  - SchedulePicker component for date/time
  - EventDetailsForm component (location, notes)
  - BookingSummary sidebar with total and submit button
- [ ] **Loading state**: Loading message shown while photographer details load
- [ ] **Select service**: Click on a service card → Service is selected, total updates
- [ ] **Pick date**: Use SchedulePicker to select a future date
- [ ] **Fill event details**: Enter location and notes
- [ ] **Submit booking**: Click submit → Success view appears with "Booking Request Sent!" message
- [ ] **Success view**: Shows "View My Bookings" link → Clicking navigates to `/client/bookings`
- [ ] **Validation errors**: Submit with empty form → Validation errors displayed on fields
- [ ] **Error handling**: Network errors show appropriate messages

#### 5.2 Bookings List Page (`/client/bookings`)
- [ ] **Navigate to bookings list**: `/client/bookings` loads without console errors
- [ ] **Verify page structure**:
  - Page title "My Bookings" and description
  - "Book New Session" button linking to `/client/photographers`
  - BookingFilters component (status, sort)
  - BookingsTable component with role="client"
- [ ] **View bookings**: Table displays client's bookings with correct data
- [ ] **Filter by status**: Select status filter → Table updates
- [ ] **Sort**: Change sort direction → Table updates
- [ ] **Cancel booking**: Click cancel on pending booking → Confirmation dialog → Booking cancelled
- [ ] **Cannot cancel confirmed booking**: Cancel button disabled or hidden for confirmed bookings
- [ ] **Pagination**: If multiple pages, pagination controls work
- [ ] **Empty state**: When no bookings, appropriate empty state displayed
- [ ] **Loading state**: Loading indicator shown while fetching

### 6. Frontend UI Verification — Photographer Role

#### 6.1 Bookings Management Page (`/photographer/bookings`)
- [ ] **Navigate to bookings page**: Login as photographe001, navigate to `/photographer/bookings`
- [ ] **Verify page structure**:
  - Page title "My Bookings" and description "Manage your photography bookings and sessions."
  - BookingFilters component
  - BookingsTable component with role="photographer"
- [ ] **View assigned bookings**: Table displays bookings assigned to this photographer
- [ ] **Confirm pending booking**: Click confirm → Status changes to 'confirmed'
- [ ] **Complete confirmed booking**: Click complete → Status changes to 'completed'
- [ ] **Cancel pending booking**: Click cancel → Confirmation → Status changes to 'cancelled'
- [ ] **Cancel confirmed booking**: Click cancel → Confirmation → Status changes to 'cancelled'
- [ ] **Cannot complete pending booking**: Complete button disabled/hidden for pending bookings
- [ ] **Filter by status**: Works correctly
- [ ] **Sort**: Works correctly
- [ ] **Pagination**: Works correctly
- [ ] **Empty state**: Appropriate empty state when no bookings
- [ ] **Loading state**: Loading indicator shown while fetching

### 7. Frontend UI Verification — Admin Role

#### 7.1 Admin Bookings Management
- [ ] **Check if admin bookings page exists**: Verify if there's an admin route for managing bookings
- [ ] **If admin bookings page exists**: Navigate and verify all CRUD operations
- [ ] **If admin bookings page does NOT exist**: Verify admin can access bookings via API (document as known limitation)

### 8. Cross-Role Access Control

#### 8.1 Role-Based Route Access
- [ ] **Client accessing photographer bookings**: `/photographer/bookings` → Redirected to client dashboard
- [ ] **Photographer accessing client bookings**: `/client/bookings` → Redirected to photographer dashboard
- [ ] **Admin accessing client bookings**: `/client/bookings` → Redirected to admin dashboard
- [ ] **Unauthenticated accessing booking pages**: Redirected to `/login`
- [ ] **Unauthenticated accessing booking API**: Returns 401

#### 8.2 API Authorization
- [ ] **Client cannot update status**: Returns 403
- [ ] **Client cannot delete confirmed booking**: Returns 403
- [ ] **Photographer cannot delete booking**: Returns 403
- [ ] **Photographer cannot view other's booking**: Returns 403
- [ ] **Client cannot view other's booking**: Returns 403

### 9. Database & Data Integrity

#### 9.1 Booking Creation
- [ ] **Verify bookings table**: Record created with correct `client_id`, `photographer_id`, `status: 'pending'`
- [ ] **Verify foreign keys**: `client_id` references valid user, `photographer_id` references valid photographer
- [ ] **Verify photographer_service_id**: When provided, references valid service

#### 9.2 Status Transitions
- [ ] **Verify status changes**: Database reflects status changes after each transition
- [ ] **Verify timestamps**: `updated_at` changes after status update

#### 9.3 Booking Deletion
- [ ] **Verify deletion**: Record removed from database after successful delete
- [ ] **Verify soft deletes**: If implemented, check `deleted_at` timestamps

### 10. End-to-End Booking Lifecycle Test

#### 10.1 Complete Happy Path
- [ ] **Client creates booking**: client001 creates booking with photographe001
- [ ] **Photographer sees booking**: photographe001 lists bookings → New booking appears
- [ ] **Photographer confirms booking**: photographe001 confirms → Status = 'confirmed'
- [ ] **Client sees confirmed status**: client001 views booking → Status = 'confirmed'
- [ ] **Photographer completes booking**: photographe001 completes → Status = 'completed'
- [ ] **Client sees completed status**: client001 views booking → Status = 'completed'
- [ ] **Admin sees all**: admin001 lists bookings → Both client and photographer see the booking

#### 10.2 Cancellation Path
- [ ] **Client creates booking**: client001 creates booking with photographe001
- [ ] **Client cancels pending booking**: client001 cancels → Status = 'cancelled'
- [ ] **Photographer sees cancelled**: photographe001 lists → Booking shows as 'cancelled'

#### 10.3 Photographer Cancellation Path
- [ ] **Client creates booking**: client001 creates booking with photographe001
- [ ] **Photographer confirms**: photographe001 confirms → Status = 'confirmed'
- [ ] **Photographer cancels**: photographe001 cancels → Status = 'cancelled'
- [ ] **Client sees cancelled**: client001 views → Status = 'cancelled'

## Test Data Requirements

### Test Users
| Email | Role | Password |
|-------|------|----------|
| admin001@moussawer.ai | admin | password |
| photographe001@moussawer.ai | photographer | password |
| client001@moussawer.ai | client | password |

### Photographer Profile (photographe001)
- bio: "Professional photographer with 5 years of experience"
- hourly_rate: 150
- portfolio_url: null (or a valid URL)
- availability_status: 'available'

### Photographer Services (photographe001)
| Name | Description | Price |
|------|-------------|-------|
| Wedding Photography | Full-day wedding coverage | 200 |
| Portrait Session | 2-hour portrait session | 150 |

### Client Profile (client001)
- phone: "+1234567890"
- address: "123 Test Street"

### Booking Test Data
- scheduled_date: Future date (e.g., now()->addDays(7))
- location: "456 Booking Ave, Montreal"
- notes: "Test booking for mission verification"

## Success Criteria
- [ ] All API endpoints return correct status codes (201, 200, 204, 401, 403, 404, 409, 422)
- [ ] Booking status lifecycle works correctly for all valid transitions
- [ ] Invalid status transitions are rejected with 422
- [ ] Frontend UI is fully functional with no console errors
- [ ] Client can create, view, list, filter, and cancel bookings
- [ ] Photographer can view, confirm, complete, and cancel assigned bookings
- [ ] Admin can view, update status, and delete any booking
- [ ] Role-based access control is enforced for all API endpoints and frontend routes
- [ ] Database changes persist correctly
- [ ] End-to-end booking lifecycle works (create → confirm → complete)
- [ ] Cancellation flows work (client cancel pending, photographer cancel pending/confirmed)

## Common Pitfalls to Check
1. **Photographer availability check**: Creating booking for unavailable photographer returns 409, not 422
2. **Status transition validation**: Only valid transitions allowed (pending→confirmed, pending→cancelled, confirmed→completed, confirmed→cancelled)
3. **Role-based filtering**: Client sees only own bookings, photographer sees only assigned, admin sees all
4. **Booking deletion rules**: Client can only delete pending bookings; photographer cannot delete; admin can delete any
5. **Future date validation**: Past dates rejected with 422
6. **Frontend route protection**: Booking request page requires client role; non-clients redirected
7. **Booking summary calculation**: Total price should reflect selected service price
8. **Modal/form state**: Booking form resets properly after successful submission
9. **Pagination**: Backend paginates at 15 per page; frontend should handle pagination UI
10. **Admin bookings page**: May not exist as a frontend route — verify and document

## Verification Checklist
- [ ] API layer: All endpoints tested with success/failure cases for all three roles
- [ ] Frontend layer: Complete user workflow tested via browser for client and photographer
- [ ] Database layer: Data integrity verified after all operations
- [ ] Security layer: Role-based access control verified for all endpoints
- [ ] Error handling: Graceful error messages for all failure scenarios
- [ ] End-to-end: Complete booking lifecycle tested from creation to completion

## Notes
- Use Playwright MCP for browser automation (headless mode required)
- Use Laravel Boost tools for database queries and schema inspection
- Run relevant tests: `sail artisan test --compact tests/Feature/Booking/BookingTest.php`
- Run client booking request tests: `sail artisan test --compact tests/Feature/Api/Client/BookingRequestTest.php`
- Run model tests: `sail artisan test --compact tests/Unit/Models/BookingTest.php`
- Format PHP code: `sail bin pint --dirty --format agent`
- The admin bookings frontend page may not exist yet — check `resources/js/router.js` for admin booking routes
- The booking request page at `/photographers/{id}/book` requires client authentication
- The discover photographers page at `/photographers` is public (no auth required)
