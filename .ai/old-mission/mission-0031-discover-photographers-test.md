# Test the "Discover Photographers" Client Interface

## Mission-ID: 0031-discover-photographers-test

## Task Overview
Test the client-facing "Discover Photographers" feature to ensure clients can search, filter, view photographer profiles, and initiate booking requests. This feature allows clients to browse available photographers, filter by location/category/price, view detailed profiles, and book sessions.

## Explicit Requirements

### 1. Backend API Verification (Public Endpoints)

#### 1.1 Photographer Search (`GET /api/photographers`)
- [ ] **List all available photographers**: Returns 200 with paginated list of photographers
- [ ] **Filter by location**: `?location=Paris` → Returns photographers with matching bio
- [ ] **Filter by category**: `?category=Wedding` → Returns photographers with matching service name
- [ ] **Filter by price range**: `?min_price=100&max_price=200` → Returns photographers within hourly rate range
- [ ] **Combine multiple filters**: `?location=Paris&category=Wedding&min_price=50` → Returns intersection of all filters
- [ ] **Only available photographers**: Unavailable photographers are excluded from results
- [ ] **Pagination**: Response includes pagination metadata (current_page, last_page, per_page, total)
- [ ] **Empty results**: Returns empty `data` array when no photographers match criteria
- [ ] **Invalid parameters**: Graceful handling of invalid filter values (e.g., negative prices)

#### 1.2 Photographer Profile (`GET /api/photographers/{id}`)
- [ ] **View photographer profile**: Returns 200 with photographer details including user info and services
- [ ] **View with services loaded**: Response includes `services` array with service details
- [ ] **Non-existent photographer**: Returns 404 with appropriate error message
- [ ] **Unauthenticated access**: Public endpoint, accessible without authentication

### 2. Frontend UI Verification (Client Role)

#### 2.1 Search Discovery Page (`/photographers`)
- [ ] **Navigate to discover page**: `/photographers` loads without console errors
- [ ] **Verify page structure**:
  - Page title "Discover Photographers" and subtitle present
  - Search bar with location input and search button
  - Sidebar with filters (Category dropdown, Price Range inputs, Clear All button)
  - Photographer grid displaying results
- [ ] **Initial load**: Photographers are fetched on page mount and displayed in grid
- [ ] **Loading state**: Skeleton cards shown while data is loading
- [ ] **Empty state**: "No photographers found matching your criteria." message when no results
- [ ] **Error state**: Error message displayed when API call fails

#### 2.2 Search & Filter Functionality
- [ ] **Location search**: Type location and press Enter or click Search → Results filtered
- [ ] **Category filter**: Select category from dropdown → Results filtered automatically
- [ ] **Price range filter**: Enter min/max price → Results filtered automatically
- [ ] **Clear all filters**: Click "Clear All Filters" → All filters reset, fresh results loaded
- [ ] **Combined filters**: Multiple filters applied simultaneously work correctly
- [ ] **Search bar updates**: Location input reflects current filter state

#### 2.3 Photographer Cards
- [ ] **Card displays correctly**:
  - Photographer image (or placeholder if no portfolio_url)
  - Photographer name
  - Rating (⭐ with 5.0 default)
  - Bio (or "No bio available.")
  - Price: "Starting at $X/hr"
  - "View Profile" button
- [ ] **Image fallback**: Cards without portfolio_url show placeholder image
- [ ] **Card hover effect**: Cards have hover animation (translateY(-4px))

#### 2.4 Photographer Detail View (Booking Request Page)
- [ ] **Navigate to booking**: Click "View Profile" on card → Navigates to booking page
- [ ] **Note**: Currently "View Profile" links to `/photographers` (same page) — this is a known issue
- [ ] **Booking page loads**: `/photographers/{id}/book` loads photographer details
- [ ] **Booking form elements**:
  - Service selector with photographer's services
  - Schedule picker for date
  - Event details (location, notes)
  - Booking summary sidebar
- [ ] **Submit booking**: Successful booking shows success message
- [ ] **Validation errors**: Form validation errors displayed correctly

### 3. Cross-Role Access Control
- [ ] **Public access**: `/photographers` route is public (no authentication required)
- [ ] **Client access**: Authenticated clients can access and use all features
- [ ] **Photographer access**: Photographers can view the public page
- [ ] **Admin access**: Admins can view the public page
- [ ] **Booking requires auth**: `/photographers/{id}/book` requires client authentication
- [ ] **Role enforcement**: Non-client users redirected to their dashboard when accessing booking page

### 4. Database & Data Integrity
- [ ] **Verify photographers table**: Check records match API response
- [ ] **Verify services relationship**: Photographers with services appear in category filter results
- [ ] **Verify availability filter**: Only `availability_status = 'available'` photographers returned
- [ ] **Verify pagination**: Correct number of records per page

### 5. Photographer Card "View Profile" Link Issue
- [ ] **Identify issue**: `PhotographerCard.vue` links to `{ name: 'photographer-discovery' }` instead of a dedicated profile page
- [ ] **Expected behavior**: Should link to a photographer detail/profile page (e.g., `/photographers/{id}`)
- [ ] **Impact**: Clicking "View Profile" currently navigates back to the search page instead of showing photographer details

## Test Data Requirements
- Test photographer accounts with complete profiles (bio, hourly_rate, portfolio_url, availability_status)
- Test photographers with various services (Wedding, Portrait, Event, Product, Fashion, Real Estate)
- Test photographers in different locations (Paris, London, New York, etc.)
- Test photographers with different price ranges ($50-$500/hr)
- Test unavailable photographers (should not appear in results)
- Test photographers without portfolio_url (should show placeholder)

## Success Criteria
- [ ] All API endpoints return correct status codes (200, 404)
- [ ] Search filters work correctly individually and combined
- [ ] Frontend UI is fully functional with no console errors
- [ ] Loading, empty, and error states are properly handled
- [ ] Photographer cards display all required information
- [ ] Booking flow works end-to-end for authenticated clients
- [ ] Role-based access control is enforced for booking page
- [ ] "View Profile" link issue is identified and documented

## Common Pitfalls to Check
1. **"View Profile" link misconfiguration**: Currently links to `photographer-discovery` route instead of a detail page
2. **Image loading errors**: Faker-generated portfolio URLs causing console errors (mitigated by `getValidPortfolioUrl()`)
3. **Filter reactivity**: Filters not triggering re-fetch on change
4. **Pagination**: No pagination UI in the frontend yet (only backend supports it)
5. **Empty state**: Ensure empty state shows when no photographers match
6. **Booking page auth**: Ensure unauthenticated users are redirected to login

## Verification Checklist
- [ ] API layer: Search and profile endpoints tested with success/failure cases
- [ ] Frontend layer: Complete user workflow tested via browser
- [ ] Database layer: Data integrity verified
- [ ] Security layer: Public vs authenticated access verified
- [ ] Error handling: Graceful error messages for all failure scenarios
- [ ] UI completeness: All elements present and styled correctly

## Notes
- Use Playwright MCP for browser automation (headless mode required)
- Use Laravel Boost tools for database queries and schema inspection
- Run relevant tests: `sail artisan test --compact tests/Feature/Api/Public/PhotographerSearchTest.php`
- Format PHP code: `sail bin pint --dirty --format agent`
- The "View Profile" button on PhotographerCard currently links back to the search page — this is a known UX issue that needs fixing
- The search page is publicly accessible at `/photographers` (no auth required)
- Booking page at `/photographers/{id}/book` requires client authentication
