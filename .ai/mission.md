# Photographe - Improve List Bookings Interface

## Mission-ID: 0035-Photographe-improve-list-bookings-interface

Improve the existing **Photographer Bookings (List View)** interface. 

- main file: `resources/js/views/photographer/BookingsView.vue`

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


**Requirements:**
1.  **Enhanced Features:**
    *   **Booking List (Table/Card):**
        *   *Add:* "View Details" button for every row (not just pending). right now when the user press this btn it show only a window alert, it should open a model to list details
2.  **Design & UX:**
    *   refactor all native window alerts and confimation to use vue.js dialog components.


Implement this now.


