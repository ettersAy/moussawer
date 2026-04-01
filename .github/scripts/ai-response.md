<!-- TICKET_START -->
title: Ticket 1: Backend Auth API Endpoints (Sanctum)
body: |
  Implement secure API endpoints for authentication using Laravel Sanctum.
  
  ## Tasks
  - Create `LoginController` with email/password validation via FormRequest
  - Issue Sanctum token on successful login (return user + token)
  - Create `LogoutController` to revoke current token
  - Create `MeController` returning `UserResource` with role enum
  - Add routes in `routes/api.php`: POST /login, POST /logout, GET /user
  
  ## Acceptance Criteria
  - POST /api/login returns 200 + {user, token} on valid credentials
  - POST /api/login returns 401 on invalid credentials
  - POST /api/logout invalidates token (401 on reuse)
  - GET /api/user returns 401 without token, 200 + user data with valid token
<!-- TICKET_END -->

<!-- TICKET_START -->
title: Ticket 2: Frontend Login UI & Pinia Auth Store
body: |
  Build login form and manage authentication state with Pinia.
  
  ## Tasks
  - Create `LoginView.vue` with email/password inputs + validation feedback
  - Setup `stores/auth.js` Pinia store: state (user, token), actions (login, logout, fetchUser)
  - Configure Axios interceptor in `services/api.js` to attach `Authorization: Bearer <token>`
  - Handle token storage per Sanctum best practices
  - Add loading states and error handling UI
  
  ## Acceptance Criteria
  - User can submit credentials via UI form
  - Successful login populates `authStore.user` and stores token
  - Failed login shows user-friendly error
  - Axios requests automatically include auth header when token exists
<!-- TICKET_END -->

<!-- TICKET_START -->
title: Ticket 3: Frontend Route Guards - Authentication Check
body: |
  Protect role-based routes by checking authentication status before access.
  
  ## Tasks
  - Implement Vue Router `beforeEach` global guard
  - Define meta field `requiresAuth: true` for `/admin`, `/photographer`, `/client` routes
  - Redirect unauthenticated users to `/login` with `redirect` query param
  - Allow public routes (`/login`, `/`, `/contact`) without auth check
  - Ensure guard waits for `authStore.fetchUser()` if token exists but user not loaded
  
  ## Acceptance Criteria
  - Visiting `/admin` while logged out redirects to `/login?redirect=/admin`
  - Visiting `/login` while already authenticated redirects to default dashboard
  - Public routes remain accessible without authentication
<!-- TICKET_END -->

<!-- TICKET_START -->
title: Ticket 4: Role-Based Redirection Logic (Frontend)
body: |
  Ensure users land on the dashboard matching their `UserRole` enum.
  
  ## Tasks
  - Extend Router guard to check `authStore.user.role` against route meta `allowedRoles`
  - If user role ≠ route role, redirect to their correct dashboard
  - Update Login success handler to redirect to role-specific dashboard
  - Add `allowedRoles` meta to each role route definition
  
  ## Acceptance Criteria
  - Admin logging in → redirected to `/admin`
  - Client accessing `/admin` URL → redirected to `/client`
  - Post-login redirect matches `UserRole` enum value
<!-- TICKET_END -->

<!-- TICKET_START -->
title: Ticket 5: Backend Role Authorization (Policies)
body: |
  Enforce role restrictions at API level using Laravel Policies.
  
  ## Tasks
  - Create Policies: `AdminPolicy`, `PhotographerPolicy`, `ClientPolicy`
  - Apply `->can()` checks or custom `role:` middleware in API Controllers
  - Return 403 Forbidden when token valid but role insufficient
  - Ensure `MeController` and dashboard endpoints respect role checks
  
  ## Acceptance Criteria
  - Client token calling GET /api/admin/dashboard returns 403
  - Admin token calling GET /api/admin/dashboard returns 200 + data
  - 403 responses use consistent JSON error format
<!-- TICKET_END -->
