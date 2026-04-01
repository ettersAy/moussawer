# Large Project Workflow & Structure: Moussawer

**Document Version:** 1.0  
**Project Scale:** Medium-to-Large (Team: 3-8 devs, Multiple Modules)  
**Updated:** March 2026  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Technology Stack Details](#technology-stack-details)
4. [Development Workflow](#development-workflow)
5. [AI Integration Strategy](#ai-integration-strategy)
6. [Git & Branching Strategy](#git--branching-strategy)
7. [API Architecture](#api-architecture)
8. [Database Strategy](#database-strategy)
9. [Testing Strategy](#testing-strategy)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Environment Management](#environment-management)
12. [Code Organization Principles](#code-organization-principles)

---

## Project Overview

### Moussawer: Client-Photographer Connection Platform

**Purpose:** Connect clients with professional photographers for bookings and collaborations

**Key Features:**
- Client dashboard (search, book photographers)
- Photographer profile & portfolio management
- Booking system with payments
- Rating & reviews system
- Messaging between clients & photographers
- Admin panel for moderation

**Team Structure (Typical):**
- 1 Backend Lead (Laravel)
- 1-2 Backend Devs
- 1 Frontend Lead (Vue.js)
- 1-2 Frontend Devs
- 1 QA/Testing Lead (Playwright)
- 1 DevOps (Docker/Deployment)
- 1 Project Manager

**Deployment Environments:**
- Development (local + shared dev server)
- Staging (production-like, for testing)
- Production (live)

---

## Directory Structure

### Root Level Organization

```
moussawer/
├── .ai/                           # AI Documentation & Missions
│   ├── mission-backend.md        # Backend feature missions
│   ├── mission-frontend.md       # Frontend feature missions
│   ├── context.md                # Full project context
│   ├── constraints.md            # Project-wide constraints
│   ├── conventions.md            # Code standards & patterns
│   ├── incidents.md              # Bug tracking & fixes (evolves)
│   └── architecture.md           # System design & diagrams
├── docs/                         # Documentation (Human-readable)
│   ├── architecture/
│   │   ├── README.md            # Architecture overview
│   │   ├── api-design.md        # API structure & endpoints
│   │   ├── database-schema.md   # DB structure & relationships
│   │   └── sequence-diagrams.md # Feature flows
│   ├── guides/
│   │   ├── setup.md             # Getting started guide
│   │   ├── development.md       # Daily development workflow
│   │   ├── testing.md           # Testing guide (Playwright)
│   │   └── deployment.md        # Deployment procedures
│   └── API/
│       ├── authentication.md    # Auth flow & tokens
│       ├── endpoints.md         # All API endpoints
│       └── versioning.md        # API versioning strategy
├── backend/                     # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── V1/
│   │   │   │   │   │   ├── AuthController.php
│   │   │   │   │   │   ├── ClientController.php
│   │   │   │   │   │   ├── PhotographerController.php
│   │   │   │   │   │   ├── BookingController.php
│   │   │   │   │   │   └── ReviewController.php
│   │   │   │   │   └── V2/        # Future API versioning
│   │   │   ├── Middleware/
│   │   │   │   ├── Authenticate.php
│   │   │   │   ├── RoleCheck.php
│   │   │   │   └── ApiResponse.php (wraps responses)
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Client/
│   │   │   │   ├── Photographer/
│   │   │   │   └── Booking/
│   │   │   └── Resources/
│   │   │       ├── ClientResource.php
│   │   │       ├── PhotographerResource.php
│   │   │       └── BookingResource.php
│   │   ├── Models/
│   │   │   ├── User.php         # Base user model (role-based)
│   │   │   ├── Client.php
│   │   │   ├── Photographer.php
│   │   │   ├── Booking.php
│   │   │   ├── Payment.php
│   │   │   └── Review.php
│   │   ├── Services/
│   │   │   ├── AuthService.php
│   │   │   ├── BookingService.php (business logic)
│   │   │   ├── PaymentService.php
│   │   │   └── NotificationService.php
│   │   ├── Events/
│   │   │   ├── BookingCreated.php
│   │   │   ├── BookingConfirmed.php
│   │   │   └── ReviewSubmitted.php
│   │   ├── Jobs/
│   │   │   ├── ProcessPayment.php
│   │   │   └── SendNotification.php
│   │   ├── Repositories/        # Data access layer (optional but recommended)
│   │   │   ├── BookingRepository.php
│   │   │   ├── ClientRepository.php
│   │   │   └── PhotographerRepository.php
│   │   ├── Traits/
│   │   │   ├── HasApiTokens.php
│   │   │   └── HasRoles.php
│   │   └── Exceptions/
│   │       ├── BookingNotFoundException.php
│   │       └── PaymentFailedException.php
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 2024_01_01_000000_create_users_table.php
│   │   │   ├── 2024_01_02_000000_create_photographers_table.php
│   │   │   ├── 2024_01_03_000000_create_bookings_table.php
│   │   │   ├── 2024_01_04_000000_create_payments_table.php
│   │   │   └── 2024_01_05_000000_create_reviews_table.php
│   │   ├── seeders/
│   │   │   ├── DatabaseSeeder.php
│   │   │   ├── UserSeeder.php
│   │   │   └── PhotographerSeeder.php
│   │   └── factories/
│   │       ├── ClientFactory.php
│   │       └── PhotographerFactory.php
│   ├── routes/
│   │   ├── api.php              # API routes (v1, v2, etc.)
│   │   ├── web.php              # Web routes (admin, health check)
│   │   └── channels.php         # WebSocket channels (if needed)
│   ├── tests/
│   │   ├── Feature/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginTest.php
│   │   │   │   └── RegisterTest.php
│   │   │   ├── Booking/
│   │   │   │   ├── CreateBookingTest.php
│   │   │   │   └── CancelBookingTest.php
│   │   │   └── Payment/
│   │   │       └── ProcessPaymentTest.php
│   │   ├── Unit/
│   │   │   ├── Models/
│   │   │   ├── Services/
│   │   │   └── Jobs/
│   │   └── TestCase.php
│   ├── .env.example
│   ├── .env.testing
│   ├── docker-compose.yml       # Sail configuration
│   ├── Dockerfile
│   ├── composer.json
│   └── phpunit.xml
├── frontend/                    # Vue.js 3 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   ├── Navbar.vue
│   │   │   │   ├── Button.vue
│   │   │   │   └── Modal.vue
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.vue
│   │   │   │   ├── AuthLayout.vue
│   │   │   │   └── DashboardLayout.vue
│   │   │   ├── client/
│   │   │   │   ├── Dashboard.vue
│   │   │   │   ├── Search.vue
│   │   │   │   ├── PhotographerProfile.vue
│   │   │   │   └── Bookings.vue
│   │   │   └── photographer/
│   │   │       ├── Dashboard.vue
│   │   │       ├── Profile.vue
│   │   │       ├── Portfolio.vue
│   │   │       └── BookingRequests.vue
│   │   ├── views/               # Page components (for routing)
│   │   │   ├── Home.vue
│   │   │   ├── Auth/
│   │   │   │   ├── Login.vue
│   │   │   │   └── Register.vue
│   │   │   ├── NotFound.vue
│   │   │   └── ServerError.vue
│   │   ├── router/
│   │   │   ├── index.js         # Router configuration
│   │   │   ├── auth.js          # Auth routes
│   │   │   ├── client.js        # Client routes
│   │   │   └── photographer.js  # Photographer routes
│   │   ├── stores/              # Pinia stores (state management)
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── bookings.js
│   │   │   └── notifications.js
│   │   ├── services/            # API & business logic
│   │   │   ├── api.js           # Axios instance
│   │   │   ├── auth.js          # Auth API calls
│   │   │   ├── booking.js       # Booking API calls
│   │   │   └── photographer.js
│   │   ├── utils/
│   │   │   ├── formatters.js    # Date, number formatting
│   │   │   ├── validators.js    # Input validation
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── variables.css    # CSS variables, colors
│   │   │   ├── common.css
│   │   │   └── themes/
│   │   │       └── dark.css
│   │   ├── App.vue
│   │   └── main.js
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   └── services/
│   │   └── e2e/                 # Playwright tests
│   │       ├── auth.spec.js
│   │       ├── booking.spec.js
│   │       └── search.spec.js
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── mobile/                      # Android/Flutter app (if applicable)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── services/
│   │   └── providers/
│   ├── android/
│   ├── ios/
│   ├── pubspec.yaml
│   └── test/
├── e2e/                         # Playwright end-to-end tests
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── login.spec.js
│   │   │   └── register.spec.js
│   │   ├── booking/
│   │   │   ├── create-booking.spec.js
│   │   │   └── cancel-booking.spec.js
│   │   └── search/
│   │       └── search-photographers.spec.js
│   ├── fixtures/
│   │   ├── test-data.js
│   │   └── auth.fixture.js
│   ├── config/
│   │   └── playwright.config.js
│   ├── package.json
│   └── .env.example
├── .github/
│   └── workflows/
│       ├── backend-tests.yml    # Laravel tests CI
│       ├── frontend-tests.yml   # Vue tests CI
│       ├── e2e-tests.yml        # Playwright CI
│       └── deploy.yml           # Deployment automation
├── config/
│   ├── docker-compose.yml       # Local dev environment
│   ├── nginx.conf               # Web server config
│   └── .env.example
├── scripts/
│   ├── setup.sh                 # Initial project setup
│   ├── migrate.sh               # Database migrations
│   └── deploy.sh                # Deployment script
├── docs-public/                 # Public API documentation (generated)
├── .gitignore
├── README.md
├── CONTRIBUTING.md
└── docker-compose.yml           # Main compose file
```

---

## Technology Stack Details

### Backend: Laravel 13 API

**Architecture:** RESTful API with API versioning (V1, V2)

```
Request Flow:
Client → Router → Middleware → Controller → Service → Repository → Database
```

**Key Patterns:**
- **Controllers:** Handle HTTP requests only (thin)
- **Services:** Business logic (thick, reusable)
- **Repositories:** Data access layer (optional but recommended for large projects)
- **Resources:** API response transformation (Laravel Resource classes)
- **Requests:** Form validation & authorization
- **Events/Jobs:** Async operations (payments, notifications)

**API Structure:**
```
/api/v1/
  /auth
    POST   /login
    POST   /register
    POST   /logout
    POST   /refresh-token
  /clients
    GET    /search (search photographers)
    GET    /:id (get photographer profile)
    POST   /profile (update client profile)
  /photographers
    GET    / (list photographers)
    GET    /:id (profile)
    POST   /portfolio (add portfolio items)
  /bookings
    POST   / (create booking)
    GET    / (list bookings)
    PATCH  /:id/cancel
  /reviews
    POST   / (submit review)
    GET    / (get reviews)
```

### Frontend: Vue 3 SPA (Composition API)

**State Management:** Pinia (replacing Vuex)

```
User Flow:
User Action → Component → Store Action → Service API Call → Response → Store Update → Component Re-render
```

**Key Patterns:**
- **Components:** UI + Logic (Composition API)
- **Stores (Pinia):** Global state management
- **Services:** API communication layer
- **Router:** Page navigation
- **Composables:** Reusable logic functions

**Routing Structure:**
```
/                    # Home
/auth/login          # Public
/auth/register       # Public
/dashboard           # Protected (role-based)
  /client            # Client dashboard
  /photographer      # Photographer dashboard
/photographer/:id    # Public profile
/search              # Search results
```

### Testing: Playwright

**E2E Test Flow:**
```
User scenarios → Browser automation → Verify UI & API responses
```

**Coverage:**
- User authentication (login, register, logout)
- Booking workflow (search, book, cancel)
- Photographer profile management
- Payment processing
- Review submission

### Database: MySQL

**Key Tables:**
- `users` (base)
- `clients` (extends users)
- `photographers` (extends users, with portfolio)
- `bookings` (links client + photographer)
- `payments` (booking payments)
- `reviews` (client → photographer)
- `messages` (client ↔ photographer chat)

---

## Development Workflow

### Phase 1: Initial Setup (Week 1)

```
1. Project initialization
   ├─ Clone repository
   ├─ Run: ./scripts/setup.sh
   ├─ Configure .env files
   └─ Start Docker containers: docker-compose up

2. Verify environments
   ├─ Backend: http://localhost:8000/api/health
   ├─ Frontend: http://localhost:5173
   └─ MySQL: Verify connection

3. Database setup
   ├─ Run migrations: php artisan migrate
   ├─ Run seeders: php artisan db:seed
   └─ Verify tables in MySQL
```

### Phase 2: Feature Development (Ongoing)

**Daily Workflow:**

```
Morning:
  1. Pull latest: git pull origin develop
  2. Create feature branch: git checkout -b feature/xyz
  3. Start Docker: docker-compose up

Development:
  4. Backend:
     ├─ Write migration (database schema)
     ├─ Create model & relationships
     ├─ Write API controller & service
     ├─ Add unit tests
     └─ Run tests: php artisan test

  5. Frontend:
     ├─ Create components (Vue)
     ├─ Add to store (Pinia)
     ├─ Integrate API service
     ├─ Add unit tests
     └─ Run tests: npm run test:unit

  6. E2E Tests:
     ├─ Write Playwright scenario
     └─ Run: npx playwright test

Commit/Push:
  7. Stage changes: git add .
  8. Commit: git commit -m "feat: Add booking confirmation"
  9. Push: git push origin feature/xyz

Code Review:
  10. Create Pull Request on GitHub
  11. Peer review
  12. Address feedback
  13. Merge to develop
```

### Phase 3: Pre-Deployment

```
1. Feature freeze (stop new features)
2. Run full test suite:
   ├─ Backend: php artisan test
   ├─ Frontend: npm run test:unit
   └─ E2E: npx playwright test
3. Staging deployment
4. QA testing on staging
5. Release notes documentation
6. Production deployment
```

---

## AI Integration Strategy

> Canonical source for AI-driven work: `.ai/` folder. Human-readable mirror: `doc/`.

### For Moussawer Project Scale

**AI is best used for:**
- Feature implementation (schema → API → UI)
- Refactoring & optimization
- Testing (writing tests for features)
- Bug fixes (with context)
- Documentation

### .ai/ File Structure

```
.ai/
├── mission-backend.md      # Current backend feature task
├── mission-frontend.md     # Current frontend feature task
├── context.md              # ONCE (shared context)
├── constraints.md          # ONCE (shared constraints)
├── conventions.md          # ONCE (shared conventions)
├── architecture.md         # ONCE (system design)
├── api-spec.md             # ONCE (API endpoints)
├── incidents.md            # EVOLVING (bugs & fixes)
└── examples.md             # ONCE (code patterns)
```

### Why "ONCE" vs "EVOLVING"

**ONCE files** (stable, rarely change):
- `context.md` - Project structure, tech stack
- `constraints.md` - Safety rules, what not to do
- `conventions.md` - Code standards
- `architecture.md` - System design

**EVOLVING files** (update after each task):
- `mission-backend.md` - Updated with each new feature
- `mission-frontend.md` - Updated with each new feature
- `incidents.md` - New entry each time a bug is found

### AI Workflow Per Feature

```
Step 1: Prepare Documentation
├─ Create/update mission-backend.md (API requirements)
├─ Create/update mission-frontend.md (UI requirements)
└─ Reference context.md, constraints.md, conventions.md

Step 2: Backend Development
└─ AI reads: mission-backend.md + context.md + constraints.md + conventions.md
   ├─ Implements: Migration → Model → Service → Controller → Tests
   └─ Output: Full backend feature

Step 3: Frontend Development
└─ AI reads: mission-frontend.md + context.md + constraints.md + conventions.md
   ├─ Implements: Components → Store → Service → Tests
   └─ Output: Full frontend feature

Step 4: E2E Testing
└─ AI reads: mission-backend.md + mission-frontend.md + existing test patterns
   ├─ Implements: Playwright test scenarios
   └─ Output: E2E test suite

Step 5: Documentation
├─ Update incidents.md if bugs found
└─ Update conventions.md if new patterns discovered

Step 6: Code Review
├─ Human review + test
└─ Feedback loop to AI if needed
```

---

## Git & Branching Strategy

### Branch Naming Convention

```
feature/user-authentication          # New feature
feature/booking-confirmation         # Feature with hyphens
bugfix/payment-calculation-error     # Bug fix
hotfix/critical-security-issue       # Critical production fix
refactor/optimize-db-queries         # Refactoring
chore/update-dependencies            # Maintenance
```

### Commit Message Convention

```
format: <type>(<scope>): <subject>

Types:
  feat:       New feature
  fix:        Bug fix
  refactor:   Code refactoring (no behavior change)
  test:       Test addition/modification
  docs:       Documentation
  chore:      Maintenance (deps, config)
  perf:       Performance improvement

Example:
  feat(booking): Add booking confirmation email
  fix(payment): Handle payment failure gracefully
  test(auth): Add login endpoint tests
  refactor(models): Extract booking status logic
```

### Workflow

```
1. Create feature branch from develop
   git checkout -b feature/xyz develop

2. Work on feature (commit regularly)
   git commit -m "feat(module): description"

3. Push to remote
   git push origin feature/xyz

4. Create Pull Request
   ├─ Link to issue
   ├─ Describe changes
   └─ Request reviewers

5. Code review
   ├─ Address feedback
   └─ Commit: git commit -m "review: address feedback"

6. Merge to develop
   git merge --squash feature/xyz
   (OR merge with history if complex)

7. Deploy to staging
   git pull origin develop
   deploy staging

8. After QA approval
   git checkout main
   git merge develop
   deploy production
```

### Branch Protection Rules (GitHub)

```
Require:
  ✓ Pull request review before merge
  ✓ Status checks pass (CI/CD)
  ✓ Code review (minimum 1 reviewer for develop, 2 for main)
  ✓ Branches are up to date before merge
```

---

## API Architecture

### Response Format (Consistent)

**Success Response:**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": 1,
    "name": "John Photographer",
    "email": "john@example.com"
  },
  "message": "Photographer retrieved successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "status": 400,
  "error": "validation_error",
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "phone": ["Phone must be valid"]
  }
}
```

### API Middleware

```
All API requests flow through:
  1. CORS middleware (allow web + mobile)
  2. Rate limiting (prevent abuse)
  3. Authentication (JWT token)
  4. Authorization (role/permission check)
  5. Request validation
  6. Business logic
  7. Response formatting
  8. Logging
```

### Authentication & Tokens

**JWT Token Flow:**

```
1. POST /api/v1/auth/login
   ├─ Email + Password
   └─ Returns: { access_token, refresh_token }

2. Store tokens
   ├─ Frontend: localStorage/sessionStorage
   └─ Mobile: Secure storage

3. API requests
   Header: Authorization: Bearer {access_token}

4. Token refresh
   ├─ When access_token expires
   └─ POST /api/v1/auth/refresh-token
      Returns: { new_access_token }

5. Logout
   └─ POST /api/v1/auth/logout (invalidate tokens)
```

### API Versioning

**Why versioning matters:**

```
Without versioning:
  ✗ Breaking changes affect all clients
  ✗ Can't support old mobile app versions

With versioning:
  ✓ Introduce changes in /api/v2
  ✓ Keep /api/v1 stable
  ✓ Gradual migration path
```

**Structure:**
```
/api/v1/    ← Stable, deprecated soon
/api/v2/    ← Current version
/api/v3/    ← Future version (in development)
```

### Pagination

```
GET /api/v1/photographers?page=1&per_page=20

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}
```

---

## Database Strategy

### Migration Workflow

```
1. Create new migration
   php artisan make:migration create_bookings_table

2. Define schema
   Schema::create('bookings', function (Blueprint $table) {
     $table->id();
     $table->foreignId('client_id')->constrained('users');
     $table->foreignId('photographer_id')->constrained('users');
     $table->dateTime('scheduled_at');
     $table->enum('status', ['pending', 'confirmed', 'cancelled']);
     $table->timestamps();
   });

3. Run migration
   php artisan migrate

4. Rollback if needed
   php artisan migrate:rollback
```

### Relationships (Model Design)

```
User (base)
├─ Client (1-to-1)
├─ Photographer (1-to-1)

Client
├─ Bookings (1-to-many as client)
├─ Reviews (1-to-many as reviewer)

Photographer
├─ Bookings (1-to-many as photographer)
├─ Portfolio (1-to-many)
├─ Reviews (1-to-many as reviewee)

Booking
├─ Client (many-to-1)
├─ Photographer (many-to-1)
├─ Payment (1-to-1)

Payment
├─ Booking (many-to-1)

Review
├─ Client (many-to-1 as reviewer)
├─ Photographer (many-to-1 as reviewee)
```

### Naming Conventions

```
✓ Tables: plural (users, bookings, photographers)
✓ Columns: snake_case (user_id, created_at)
✓ Foreign keys: {model}_id (user_id, booking_id)
✓ Timestamps: created_at, updated_at (automatic)
✓ Soft deletes: deleted_at (soft delete column)
✓ Booleans: is_{adjective} (is_active, is_verified)
✓ Status: enum with meaningful values
```

### Indexing Strategy

```
Index these columns:
  ✓ Primary keys (automatic)
  ✓ Foreign keys (relationship queries)
  ✓ Frequently filtered columns (email, status)
  ✓ Frequently sorted columns (created_at)
  ✓ Unique columns (email, username)

Example:
$table->string('email')->unique()->index();
$table->foreignId('user_id')->constrained()->index();
$table->enum('status', ...)->index();
```

---

## Testing Strategy

### Three Levels of Testing

#### 1. Unit Tests (Backend)

**What:** Test individual functions/methods in isolation

```php
Tests/Unit/BookingServiceTest.php

test('calculateTotalPrice includes service fee', function () {
    $booking = new Booking();
    $price = $booking->calculateTotalPrice(1000);
    
    expect($price)->toBe(1100); // Base + 10% fee
});
```

**Run:**
```bash
php artisan test --filter=Unit
```

#### 2. Feature Tests (Backend)

**What:** Test API endpoints with database

```php
Tests/Feature/Booking/CreateBookingTest.php

test('client can create booking', function () {
    $client = Client::factory()->create();
    $photographer = Photographer::factory()->create();
    
    $response = $this->actingAs($client)
        ->postJson('/api/v1/bookings', [
            'photographer_id' => $photographer->id,
            'date' => '2024-12-25',
            'price' => 500,
        ]);
    
    $response->assertStatus(201);
    assertDatabaseHas('bookings', [...]);
});
```

**Run:**
```bash
php artisan test --filter=Feature
```

#### 3. E2E Tests (Playwright)

**What:** Test complete user workflows in browser

```javascript
tests/e2e/booking.spec.js

test('user can search and book photographer', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name=email]', 'user@example.com');
    await page.fill('input[name=password]', 'password');
    await page.click('button:has-text("Login")');
    
    // Search photographers
    await page.goto('/search');
    await page.fill('input[placeholder="Search"]', 'portrait');
    await page.click('text=Jane Photographer');
    
    // Book
    await page.click('button:has-text("Book Now")');
    await page.fill('input[name=date]', '2024-12-25');
    await page.click('button:has-text("Confirm Booking")');
    
    // Verify success
    await expect(page).toHaveURL('/bookings');
});
```

**Run:**
```bash
npm run test:e2e    # Run all
npm run test:e2e -- --headed  # See browser
```

### Test Coverage Goals

| Level | Target | Priority |
|-------|--------|----------|
| Unit | 80%+ | API business logic |
| Feature | 90%+ | All API endpoints |
| E2E | Key workflows | Critical user paths |

### Testing Before Merge

```
Must pass ALL:
  ✓ Backend unit tests
  ✓ Backend feature tests
  ✓ Frontend unit tests
  ✓ E2E tests (at least critical paths)
  ✓ Code review (minimum 1 person)
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**When code is pushed to GitHub:**

```
On: Push to any branch
│
├─ Backend Tests
│  ├─ Setup Laravel
│  ├─ Run: php artisan test
│  └─ Report: ✓ Pass/✗ Fail
│
├─ Frontend Tests
│  ├─ Setup Node.js
│  ├─ Run: npm run test:unit
│  └─ Report: ✓ Pass/✗ Fail
│
├─ E2E Tests
│  ├─ Setup Playwright
│  ├─ Start servers
│  ├─ Run: npx playwright test
│  └─ Report: ✓ Pass/✗ Fail
│
└─ Deploy (only if all pass + on main/develop)
   ├─ Build frontend
   ├─ Push to staging/production
   └─ Run migrations
```

### Workflow Files

**`.github/workflows/backend-tests.yml`**
```yaml
name: Backend Tests
on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        options: --health-cmd="mysqladmin ping"
        env:
          MYSQL_DATABASE: moussawer_test
          MYSQL_ROOT_PASSWORD: root

    steps:
      - uses: actions/checkout@v3
      - uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
          extensions: mysql, pdo_mysql
      
      - name: Install dependencies
        run: cd backend && composer install
      
      - name: Run tests
        run: cd backend && php artisan test
        env:
          DB_CONNECTION: mysql
          DB_DATABASE: moussawer_test
```

### Deployment Pipeline

**Manual trigger to staging/production:**

```
Staging (automatic after merge to develop):
  1. Checkout develop branch
  2. Build frontend (npm run build)
  3. SSH to staging server
  4. Pull latest code
  5. Run migrations
  6. Restart services
  7. Run smoke tests

Production (manual approval):
  1. Checkout main branch
  2. Tag release: v1.2.3
  3. Build frontend
  4. SSH to production server
  5. Pull code (with backup)
  6. Run migrations
  7. Restart services
  8. Verify health checks
```

---

## Environment Management

### Environment Files

**`.env.example` (committed to git)**
```env
APP_NAME=Moussawer
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=moussawer
DB_USERNAME=root
DB_PASSWORD=

REDIS_PASSWORD=

JWT_SECRET=generated_during_setup
```

**`.env` (NOT committed, local only)**
```env
# Same as .env.example but with actual values
DB_PASSWORD=actual_password
JWT_SECRET=actual_secret_key
```

**`.env.testing` (for test database)**
```env
DB_DATABASE=moussawer_test
```

### Three Environments

| Environment | URL | Database | Redis | Debugging |
|-------------|-----|----------|-------|-----------|
| Development | localhost:8000 | moussawer_dev | local | Enabled |
| Staging | staging.moussawer.app | moussawer_staging | staging | Limited |
| Production | moussawer.app | moussawer_prod | prod | Disabled |

### Docker Setup

**`docker-compose.yml` - Local Development**

```yaml
version: '3.8'

services:
  app:
    image: sailantichrist/app
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/var/www/html
    environment:
      APP_DEBUG: "true"
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: moussawer
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  node:
    image: node:18-alpine
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    working_dir: /app
    command: npm run dev

volumes:
  mysql-data:
```

---

## Code Organization Principles

### Single Responsibility Principle (SRP)

**Each class has ONE reason to change:**

```
✓ BookingService: Only handles booking logic
✓ PaymentService: Only handles payments
✓ NotificationService: Only sends notifications

✗ BookingController: Doesn't handle payments or notifications directly
```

### Don't Repeat Yourself (DRY)

**Reusable code goes to:**

```
Backend:
  ├─ Services (shared business logic)
  ├─ Traits (shared methods)
  └─ Repositories (shared database access)

Frontend:
  ├─ Composables (reusable Vue logic)
  ├─ Utils (helpers)
  └─ Stores (shared state)
```

### Keep It Simple (KISS)

```
✓ Simple, readable code
✓ Comments for "why", not "what"
✓ Early returns to reduce nesting
✓ Small functions (< 30 lines typically)

✗ Over-engineering
✗ Premature optimization
✗ Magic numbers
```

### Type Safety

**Backend (Laravel):**
```php
public function store(StoreBookingRequest $request): JsonResponse {
    // Request validated automatically
}
```

**Frontend (Vue + TypeScript recommended):**
```typescript
interface Booking {
  id: number;
  client_id: number;
  photographer_id: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
```

---

## Development Checklist for New Features

### ✓ Before Starting

- [ ] Create GitHub issue describing feature
- [ ] Write acceptance criteria
- [ ] Get design approval (if UI involved)
- [ ] Update `.ai/mission-*.md` files
- [ ] Discuss with team if complex

### ✓ Backend Development

- [ ] Create migration
- [ ] Create/update models
- [ ] Add relationships
- [ ] Create service class (business logic)
- [ ] Create API controller
- [ ] Write unit tests (80%+ coverage)
- [ ] Write feature tests (all endpoints)
- [ ] Document API endpoint in docs

### ✓ Frontend Development

- [ ] Create Vue components
- [ ] Add Pinia store(s)
- [ ] Create API service
- [ ] Write component tests
- [ ] Add UI validation
- [ ] Test error handling

### ✓ Testing

- [ ] Write E2E tests (critical paths)
- [ ] Manual testing on staging
- [ ] Test error scenarios
- [ ] Test with various data sizes

### ✓ Code Review

- [ ] Create Pull Request
- [ ] Pass all CI checks
- [ ] Get code review approval
- [ ] Address feedback
- [ ] Merge to develop

### ✓ Deployment

- [ ] Deploy to staging
- [ ] QA testing on staging
- [ ] Deploy to production
- [ ] Monitor logs/errors
- [ ] Verify feature works live

---

## Common Commands

### Backend (Laravel + Sail)

```bash
# Setup
./vendor/bin/sail up -d              # Start containers
./vendor/bin/sail npm install        # Install PHP deps
./vendor/bin/sail artisan migrate    # Run migrations

# Development
./vendor/bin/sail artisan tinker     # Interactive shell
./vendor/bin/sail artisan make:model User -m  # Create model + migration
php artisan queue:listen             # Process jobs

# Testing
./vendor/bin/sail test               # Run all tests
./vendor/bin/sail test --filter=BookingTest
./vendor/bin/sail artisan test:unit

# Database
./vendor/bin/sail artisan db:seed    # Run seeders
./vendor/bin/sail artisan migrate:fresh --seed  # Reset DB
```

### Frontend (Vue 3)

```bash
# Setup
npm install                          # Install dependencies
npm run dev                          # Start dev server (localhost:5173)

# Development
npm run build                        # Production build
npm run preview                      # Preview build

# Testing
npm run test:unit                    # Unit tests
npm run test:coverage                # Coverage report
```

### E2E Testing (Playwright)

```bash
# Setup
npm install                          # Install Playwright
npx playwright install               # Install browsers

# Running
npx playwright test                  # Run all tests
npx playwright test --headed         # See browser
npx playwright test --debug          # Debug mode
npx playwright show-report           # View report
```

### Docker

```bash
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose logs -f app           # View logs
docker-compose exec app bash         # Shell into container
```

---

## Resources & References

### Documentation
- [Laravel 13 Docs](https://laravel.com/docs/13)
- [Vue 3 Docs](https://vuejs.org)
- [Pinia Docs](https://pinia.vuejs.org)
- [Playwright Docs](https://playwright.dev)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MySQL Workbench](https://dev.mysql.com/workbench/) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Editor
- [GitHub](https://github.com) - Version control

### Architecture Patterns
- [RESTful API Design](https://restfulapi.net)
- [Microservices](https://microservices.io/)
- [DDD - Domain-Driven Design](https://martinfowler.com/bliki/domain-driven-design.html)

---

## Conclusion

This workflow and structure scales from team of 3 to 50+ developers:
- **Clear separation** of concerns (backend, frontend, tests)
- **Automated testing** ensures quality
- **CI/CD pipeline** enables fast deployment
- **AI integration** accelerates development
- **Documentation** maintains knowledge
- **Git workflow** enables collaboration

Next step: Implement this structure in your Moussawer project!
