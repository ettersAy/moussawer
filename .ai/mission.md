# Add API endpoint documentation

## Mission-ID: 0034-Photographe-improve-bookings-interface
Improve the existing **Photographer Bookings (List View)** interface. main file `resources/js/views/photographer/BookingsView.vue`

**Context:** We need a central hub for photographers to manage their schedule, track revenue, and respond to client requests efficiently. The current implementation is functional but lacks key data points and visual polish.

### Current folder resources

```
js
├── app.js
├── App.vue
├── components
│   ├── client
│   │   ├── booking
│   │   │   ├── BookingSummary.vue
│   │   │   ├── EventDetailsForm.vue
│   │   │   ├── SchedulePicker.vue
│   │   │   └── ServiceSelector.vue
│   │   ├── BookingsList.vue
│   ├── photographer
│   │   ├── BookingsList.vue
│   │   ├── PortfolioGrid.vue
│   │   ├── PortfolioUploadModal.vue
│   │   ├── ServiceFilters.vue
│   │   ├── ServiceHeader.vue
│   │   ├── ServiceModal.vue
│   │   ├── ServiceTableRow.vue
│   │   └── ServiceTable.vue
│   ├── shared
│   │   ├── BookingFilters.vue
│   │   ├── BookingsTable.vue
│   │   └── Navbar.vue
│   └── ui
│       └── AppPagination.vue
├── composables
│   ├── useAuth.js
│   ├── useBookingForm.js
│   ├── useBookings.js
│   ├── usePhotographerSearch.js
│   ├── usePhotographerServices.js
│   ├── usePortfolio.js
│   ├── useProfile.js
│   ├── useToast.js
│   └── useUsers.js
├── layouts
│   ├── AdminLayout.vue
│   ├── AppLayout.vue
│   ├── BaseLayoutDispatcher.vue
│   ├── ClientLayout.vue
│   ├── PhotographerLayout.vue
│   └── PublicLayout.vue
└── router.js
css
├── app.css
├── base
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components
│   ├── admin.css
│   ├── badges.css
│   ├── bookings.css
│   ├── buttons.css
│   ├── cards.css
│   ├── client
│   │   ├── photographer-display.css
│   │   └── search-ui.css
│   ├── client.css
│   ├── dashboard.css
│   ├── forms.css
│   ├── layout.css
│   ├── modals.css
│   ├── navigation.css
│   ├── photographer.css
│   ├── profile.css
│   ├── sections.css
│   ├── tables.css
│   └── toast.css
├── layouts
│   ├── grid-system.css
│   ├── header.css
│   └── sidebar.css
├── roles
│   ├── client-layout.css
│   └── photographer-layout.css
└── utilities.css

```


**Requirements:**
1.  **Enhanced Features:**
    *   **Stats Cards:** Keep existing (Pending, Confirmed, Completed) but add "Total Revenue (Month)" if possible.
    *   **Filtering & Sorting:** Keep Status tabs and Date Range. Ensure sorting works seamlessly.
    *   **Booking List (Table/Card):**
        *   *Add:* Service Type (e.g., "Wedding Package"), Price (formatted currency), and Client Name.
        *   *Add:* "View Details" button for every row (not just pending).
        *   *Keep:* Status Badges (color-coded) and Quick Actions (Accept/Decline) for Pending items.
    *   **Empty State:** Friendly message when no bookings match filters.
2.  **Design & UX:**
    *   Improve the visual hierarchy. Use a clean, modern, minimalistic design.
    *   Ensure consistent spacing, typography, and color usage (Tailwind classes).
    *   Make the table/cards responsive and easy to scan.
3.  **Architecture:** Strictly follow the existing Admin module patterns. Consult these specific files to replicate the structure:
    *   CSS pattern: `resources/css/views/admin/users.css`
    *   JS/Composable pattern: `resources/js/composables/useUsers.js`
    *   Extract CSS to `resources/css/views/photographer/bookings.css`.
    *   Extract JS logic to `resources/js/views/photographer/bookings.js`.

**User Behavior Examples:**
*   *Example 1:* Photographer sees 3 "Pending" requests, clicks "Accept" on one, and "View Details" on another to check the location before deciding.
*   *Example 2:* Photographer filters by "Confirmed" and sorts by "Date Ascending" to see their upcoming schedule for the next month.

Implement this now.


