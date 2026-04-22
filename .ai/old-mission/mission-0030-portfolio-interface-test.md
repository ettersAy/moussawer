# Test the Portfolio Interface

## Mission-ID: 0030-portfolio-interface-test

## Task Overview
Test the photographer portfolio management interface to ensure photographers can upload, edit, and delete portfolio images, and that the admin can view photographer portfolios.

## Explicit Requirements

### 1. Backend API Verification (Photographer Role)
- [ ] **Login as photographer**: Use `photographer-one@example.com` / `password`
- [ ] **Verify profile completion**: Ensure photographer profile exists (bio, hourly rate, portfolio_url, availability_status)
- [ ] **Test portfolio endpoints**:
  - `GET /api/photographer/portfolios` - Should return 200 with empty array or existing items
  - `POST /api/photographer/portfolios` - Upload test image (multipart/form-data)
  - `PUT /api/photographer/portfolios/{id}` - Update portfolio item
  - `DELETE /api/photographer/portfolios/{id}` - Delete portfolio item
- [ ] **Test validation**: Attempt upload without profile → Should return 400 with "Please complete your photographer profile first"
- [ ] **Test image validation**: Invalid file types, size limits

### 2. Frontend UI Verification (Photographer Role)
- [ ] **Navigate to portfolio page**: `/photographer/portfolio`
- [ ] **Verify UI elements**:
  - Page title "My Portfolio" and description
  - "Upload Photo" button present and functional
  - Portfolio grid displays items (or empty state)
  - Edit/Delete buttons on portfolio items
- [ ] **Test upload workflow**:
  - Click "Upload Photo" → Modal opens
  - Fill form (title, description, category, tags, image)
  - Submit → Success toast appears
  - New item appears in grid
- [ ] **Test edit workflow**:
  - Click edit button on existing item
  - Modal opens with pre-filled data
  - Make changes and save → Success toast appears
  - Changes reflected in grid
- [ ] **Test delete workflow**:
  - Click delete button → Confirmation dialog
  - Confirm deletion → Success toast appears
  - Item removed from grid
- [ ] **Verify error handling**:
  - Upload without profile → Error message displayed
  - Network errors → Appropriate error messages

### 3. Admin Portfolio Management Verification
- [ ] **Login as admin**: Use admin credentials
- [ ] **Navigate to users page**: `/admin/users`
- [ ] **Find photographer user** and click "View Portfolio"
- [ ] **Verify admin portfolio view**:
  - Shows photographer's portfolio items
  - Admin can delete items (if needed)
  - Proper breadcrumb navigation back to users
- [ ] **Test portfolio filtering**: Filter users by "Has Portfolio" / "No Portfolio"

### 4. Database & Data Integrity
- [ ] **Verify portfolio_items table**: Check records after upload/edit/delete
- [ ] **Verify image storage**: Images stored in `storage/app/public/portfolios/`
- [ ] **Verify foreign key constraints**: Portfolio items linked to correct photographer
- [ ] **Verify soft deletes**: If implemented, check deleted_at timestamps

### 5. Cross-Role Access Control
- [ ] **Client role**: Should NOT access `/photographer/portfolio` or portfolio API endpoints
- [ ] **Admin role**: Can view but not edit photographer portfolios (except delete)
- [ ] **Unauthenticated users**: Should be redirected to login

## Test Data Requirements
- Test image files (jpg, png, webp) under 5MB
- Sample portfolio data:
  - Title: "Test Wedding Photography"
  - Description: "Beautiful outdoor wedding ceremony"
  - Category: "Wedding"
  - Tags: "outdoor, ceremony, summer"

## Success Criteria
- [ ] All API endpoints return correct status codes (200, 201, 204, 400, 403, 404)
- [ ] Frontend UI is fully functional with no console errors
- [ ] Database changes persist correctly
- [ ] Image uploads work and display properly
- [ ] Error messages are user-friendly and informative
- [ ] Role-based access control is enforced
- [ ] Admin can view photographer portfolios

## Common Pitfalls to Check
1. **Missing photographer profile**: Returns 400 error "Please complete your photographer profile first"
2. **Image URL generation**: Ensure `image_full_url` is properly constructed
3. **Form validation**: Required fields, file type/size validation
4. **State management**: Portfolio grid updates after upload/edit/delete
5. **Modal state**: Upload modal resets properly between uses

## Verification Checklist
- [ ] API layer: All endpoints tested with success/failure cases
- [ ] Frontend layer: Complete user workflow tested via browser
- [ ] Database layer: Data integrity verified
- [ ] Security layer: Role-based access control verified
- [ ] Error handling: Graceful error messages for all failure scenarios

## Notes
- Use Playwright MCP for browser automation (headless mode required)
- Use Laravel Boost tools for database queries and schema inspection
- Run relevant tests: `sail artisan test --compact tests/Feature/Photographer/PortfolioTest.php`
- Format PHP code: `sail bin pint --dirty --format agent`