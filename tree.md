
```
app
├── Console
│   └── Commands
│       ├── SeedPerformanceData.php
│       └── TestRedis.php
├── Enums
│   └── UserRole.php
├── Http
│   ├── Controllers
│   │   ├── Api
│   │   │   ├── Admin
│   │   │   │   ├── PortfolioController.php
│   │   │   │   └── UserController.php
│   │   │   ├── Auth
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── LogoutController.php
│   │   │   │   ├── MeController.php
│   │   │   │   └── RegisterController.php
│   │   │   ├── Booking
│   │   │   │   └── BookingController.php
│   │   │   ├── Client
│   │   │   │   ├── BookingRequestController.php
│   │   │   │   └── ProfileController.php
│   │   │   ├── Photographer
│   │   │   │   ├── PhotographerController.php
│   │   │   │   ├── PortfolioItemController.php
│   │   │   │   ├── ProfileController.php
│   │   │   │   └── ServiceController.php
│   │   │   └── Public
│   │   │       ├── ContactSubmissionController.php
│   │   │       ├── PhotographerProfileController.php
│   │   │       └── PhotographerSearchController.php
│   │   └── Controller.php
│   ├── Requests
│   │   ├── Admin
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   ├── Auth
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   ├── Booking
│   │   │   ├── StoreBookingRequest.php
│   │   │   └── UpdateBookingStatusRequest.php
│   │   ├── Client
│   │   │   ├── StoreBookingRequest.php
│   │   │   ├── StoreProfileRequest.php
│   │   │   └── UpdateProfileRequest.php
│   │   ├── Photographer
│   │   │   ├── StorePortfolioItemRequest.php
│   │   │   ├── StoreProfileRequest.php
│   │   │   ├── StoreServiceRequest.php
│   │   │   ├── UpdatePortfolioItemRequest.php
│   │   │   ├── UpdateProfileRequest.php
│   │   │   └── UpdateServiceRequest.php
│   │   └── StoreContactRequest.php
│   └── Resources
│       ├── BookingResource.php
│       ├── ClientProfileResource.php
│       ├── ContactSubmissionResource.php
│       ├── PhotographerProfileResource.php
│       ├── PhotographerResource.php
│       ├── PhotographerServiceResource.php
│       └── UserResource.php
├── Logging
│   ├── CustomizeFailureLogs.php
│   └── TruncateFailureLogsProcessor.php
├── Mail
│   ├── ContactSubmissionConfirmation.php
│   └── RegistrationWelcome.php
├── Models
│   ├── Booking.php
│   ├── Client.php
│   ├── ContactSubmission.php
│   ├── Payment.php
│   ├── Photographer.php
│   ├── PhotographerService.php
│   ├── PortfolioItem.php
│   ├── Review.php
│   └── User.php
├── Policies
│   ├── BookingPolicy.php
│   └── ContactSubmissionPolicy.php
├── Providers
│   └── AppServiceProvider.php
└── Services
    ├── BookingService.php
    ├── ContactService.php
    ├── PhotographerService.php
    └── UserService.php
```

---


```

resources
├── css
│   ├── app.css
│   ├── base
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── variables.css
│   ├── components
│   │   ├── admin.css
│   │   ├── auth.css
│   │   ├── badges.css
│   │   ├── bookings.css
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── client
│   │   │   ├── photographer-display.css
│   │   │   └── search-ui.css
│   │   ├── client.css
│   │   ├── dashboard.css
│   │   ├── forms.css
│   │   ├── layout.css
│   │   ├── modals.css
│   │   ├── navigation.css
│   │   ├── photographer.css
│   │   ├── profile.css
│   │   ├── sections.css
│   │   ├── tables.css
│   │   └── toast.css
│   ├── layouts
│   │   ├── grid-system.css
│   │   ├── header.css
│   │   └── sidebar.css
│   ├── README.md
│   ├── roles
│   │   ├── admin-layout.css
│   │   ├── client-layout.css
│   │   └── photographer-layout.css
│   ├── utilities.css
│   └── views
│       ├── admin
│       │   ├── photographer-services.css
│       │   ├── user-portfolio.css
│       │   └── users.css
│       ├── client
│       │   ├── booking-form.css
│       │   └── search.css
│       ├── home.css
│       └── photographer
│           ├── bookings.css
│           ├── portfolio.css
│           └── services.css
├── js
│   ├── app.js
│   ├── App.vue
│   ├── bootstrap.js
│   ├── components
│   │   ├── admin
│   │   │   ├── UserFilters.vue
│   │   │   ├── UserModal.vue
│   │   │   └── UsersTable.vue
│   │   ├── client
│   │   │   ├── booking
│   │   │   │   ├── BookingSummary.vue
│   │   │   │   ├── EventDetailsForm.vue
│   │   │   │   ├── SchedulePicker.vue
│   │   │   │   └── ServiceSelector.vue
│   │   │   ├── BookingsList.vue
│   │   │   ├── PhotographerCard.vue
│   │   │   ├── PhotographerGrid.vue
│   │   │   ├── SearchBar.vue
│   │   │   └── SearchFilters.vue
│   │   ├── photographer
│   │   │   ├── BookingDetailsModal.vue
│   │   │   ├── BookingsList.vue
│   │   │   ├── PortfolioGrid.vue
│   │   │   ├── PortfolioUploadModal.vue
│   │   │   ├── ServiceFilters.vue
│   │   │   ├── ServiceHeader.vue
│   │   │   ├── ServiceModal.vue
│   │   │   ├── ServiceTableRow.vue
│   │   │   └── ServiceTable.vue
│   │   ├── shared
│   │   │   ├── auth
│   │   │   │   └── LogoutButton.vue
│   │   │   ├── BookingFilters.vue
│   │   │   ├── BookingsTable.vue
│   │   │   ├── ConfirmationDialog.vue
│   │   │   └── Navbar.vue
│   │   └── ui
│   │       └── AppPagination.vue
│   ├── composables
│   │   ├── useAuth.js
│   │   ├── useBookingForm.js
│   │   ├── useBookings.js
│   │   ├── usePhotographerSearch.js
│   │   ├── usePhotographerServices.js
│   │   ├── usePortfolio.js
│   │   ├── useProfile.js
│   │   ├── useToast.js
│   │   └── useUsers.js
│   ├── layouts
│   │   ├── AdminLayout.vue
│   │   ├── AppLayout.vue
│   │   ├── BaseLayoutDispatcher.vue
│   │   ├── ClientLayout.vue
│   │   ├── PhotographerLayout.vue
│   │   └── PublicLayout.vue
│   ├── router
│   │   └── index.js
│   ├── router.js
│   ├── services
│   │   └── api.js
│   ├── stores
│   │   └── auth.js
│   └── views
│       ├── admin
│       │   ├── DashboardView.vue
│       │   ├── UserPortfolioView.vue
│       │   └── UsersView.vue
│       ├── auth
│       │   ├── LoginView.vue
│       │   └── RegisterView.vue
│       ├── client
│       │   ├── BookingRequestView.vue
│       │   ├── BookingsView.vue
│       │   ├── DashboardView.vue
│       │   ├── ProfileView.vue
│       │   └── SearchDiscoveryView.vue
│       ├── photographer
│       │   ├── bookings.js
│       │   ├── BookingsView.vue
│       │   ├── DashboardView.vue
│       │   ├── PortfolioView.vue
│       │   ├── ProfileView.vue
│       │   └── ServicesView.vue
│       └── public
│           ├── components
│           ├── ContactView.vue
│           └── HomeView.vue
└── views
    ├── emails
    │   ├── contact-submission-confirmation.blade.php
    │   └── registration-welcome.blade.php
    └── welcome.blade.php
```

```
e2e
├── auth
│   ├── login.spec.js
│   └── register.spec.js
├── authentication-guards.spec.js
├── client
│   └── booking-request.spec.js
├── contact
│   └── contact.spec.js
├── fixtures
│   ├── index.js
│   └── test-data.js
├── helpers
│   ├── auth-helpers.js
│   └── navigation-helpers.js
├── internal-navigation.spec.js
├── login-redirects.spec.js
├── navigation-menu.spec.js
├── pages
│   ├── ContactPage.js
│   └── LoginPage.js
└── role-based-access-control.spec.js
```


```
doc
├── API.md
├── ARCHITECTURE.md
├── BACKEND.md
├── CSS_GUIDELINES.md
├── DATABASE.md
├── FRONTEND.md
├── MYSQL_MCP_REINSTALLATION_GUIDE.md
├── performance_seeder_guide.md
├── TESTING.md
├── TOOLS.md
└── WORKFLOW.md
```


