# Photographer: Availability Calendar

## Mission-ID: 0036-Photographer-Availability-Calendar

**Description:** Visual scheduling tool allowing photographers to block dates and sync confirmed bookings before clients can request them.
**Features:**
- Interactive monthly calendar with color-coded markers for existing bookings and manual blocks.
- Click-to-toggle specific dates as `available` or `unavailable` with immediate API sync.
- Bulk select utility for blocking vacation periods or non-working days.
- Visual lock overlay preventing client selection on blocked dates.
**Contextual References:**
- Maps directly to `availability_status` enum in `photographers` table (`available`, `unavailable`, `booked`).
- CSS: `resources/css/views/photographer/calendar.css`
- Logic: `resources/js/views/photographer/calendar.js` (strictly follows `useUsers.js` extraction pattern).
- Route group requires `middleware('role:photographer')`.


### Current folder resources

```
js
├── components
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
│   ├── useBookingForm.js
│   ├── useBookings.js
│   ├── usePhotographerSearch.js
│   ├── useToast.js
│   └── useUsers.js
├── layouts
│   ├── PhotographerLayout.vue
css
├── components
│   ├── badges.css
│   ├── bookings.css
│   ├── buttons.css
│   ├── cards.css
│   ├── dashboard.css
│   ├── forms.css
│   ├── layout.css
│   ├── modals.css
│   ├── navigation.css
│   ├── photographer.css
│   ├── sections.css
│   ├── tables.css
│   └── toast.css
├── layouts
│   ├── grid-system.css
│   ├── header.css
│   └── sidebar.css
├── roles
│   └── photographer-layout.css
└── utilities.css

```



