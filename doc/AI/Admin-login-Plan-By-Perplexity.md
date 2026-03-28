You’ll use Laravel Sanctum with cookie-based SPA auth on the backend and a Pinia + Vue Router guard flow on the frontend, with an `admin` role gate to secure all admin APIs and views. Below is a practical step‑by‑step plan tailored to your existing Laravel 13 API + Vue 3 architecture. 

***

## Overall login flow

1. Vue admin login form sends email/password to Laravel via Axios.
2. Laravel Sanctum authenticates, starts a session, and sets secure cookies; response returns the current user (including `role` enum).
3. Pinia stores that user, computes `isAdmin`, and Vue Router guards allow access only to routes with `meta.requiresAdmin`. 
4. All admin API routes are protected by `auth:sanctum` + an `is_admin` middleware (or gate) on the backend, so non-admins get 403 even if they manipulate the frontend. 

***

## Backend setup: Sanctum + SPA config

1. **Install/configure Sanctum (if not already):**  
   - `composer require laravel/sanctum` and run `php artisan install:api` (Laravel 11+ style).
   - Ensure `Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` is in `api` middleware group and `auth:sanctum` is available. 

2. **Configure domains & CORS for SPA:**  
   - In `.env`, set `SANCTUM_STATEFUL_DOMAINS` to the SPA domain (e.g. `moussawer.test:5173`), and make sure CORS allows that origin with `supports_credentials` enabled.
   - Use HTTPS in real environments so cookies are `Secure` and `SameSite=Lax` or `Strict` where possible.

3. **User model & roles:**  
   - You already have a `UserRole` backed enum (`admin`, `photographer`, `client`) and helpers like `isAdmin()` on `User`. 

***

## Step 1: Admin auth routes (API)

Define explicit admin auth endpoints in `routes/api.php`:

```php
// routes/api.php

use App\Http\Controllers\Api\Admin\AdminAuthController;

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('guest:sanctum');
    Route::post('/logout', [AdminAuthController::class, 'logout'])
        ->middleware('auth:sanctum');
    Route::get('/me', [AdminAuthController::class, 'me'])
        ->middleware(['auth:sanctum', 'is_admin']);
});
```

- Use a dedicated `AdminAuthController` in `App\Http\Controllers\Api\Admin` to keep controllers “dumb” and delegate logic to an `AdminAuthService` if you want to stay close to your current SOLID structure. 
- `admin/me` will be used by the SPA on refresh to check if the user is still authenticated and is an admin. 

***

## Step 2: Login controller logic (with role check)

Create a `LoginRequest` for validation, then implement the `login` method:

```php
// app/Http/Requests/Admin/AdminLoginRequest.php
class AdminLoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email'    => ['required', 'email:rfc,dns'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
```

```php
// app/Http/Controllers/Api/Admin/AdminAuthController.php

use App\Http\Requests\Admin\AdminLoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;

class AdminAuthController extends Controller
{
    public function login(AdminLoginRequest $request)
    {
        // Attempt login using session-based auth
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! $user->isAdmin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return new UserResource($user);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}
```

- This uses Laravel’s session + cookie auth flow recommended for Sanctum SPA mode, not explicit tokens. 
- Returning a `UserResource` fits your “never expose raw models” rule and allows you to hide sensitive fields. 
***

## Step 3: Backend admin middleware / gate

1. **Create `is_admin` middleware** (simple and explicit):

```php
// app/Http/Middleware/EnsureUserIsAdmin.php

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        return $next($request);
    }
}
```

- Register this in `app/Http/Kernel.php` as `'is_admin' => \App\Http\Middleware\EnsureUserIsAdmin::class`.  

2. **Protect all admin APIs:**

```php
// routes/api.php

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'is_admin'])
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        // other admin routes...
    });
```

- This ensures even if someone bypasses the frontend, the backend still blocks non‑admin access. 

***

## Step 4: Axios / API client (Vue side)

Create a shared Axios instance configured for Sanctum:

```ts
// resources/js/services/api.ts

import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. https://moussawer.test
  withCredentials: true, // critical so cookies are sent
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export async function adminLogin(email: string, password: string) {
  // 1. Get CSRF cookie
  await api.get('/sanctum/csrf-cookie')
  // 2. Login
  const response = await api.post('/api/admin/login', { email, password })
  return response.data
}

export async function adminLogout() {
  await api.post('/api/admin/logout')
}

export async function fetchAdminMe() {
  const { data } = await api.get('/api/admin/me')
  return data
}
```

- Getting `/sanctum/csrf-cookie` before login is required to satisfy Laravel’s CSRF protection in SPA mode. 
- `withCredentials: true` ensures the browser includes and receives cookies for your API domain.

***

## Step 5: Pinia auth store for admin

Create a dedicated admin auth store:

```ts
// resources/js/stores/adminAuth.ts

import { defineStore } from 'pinia'
import { adminLogin, adminLogout, fetchAdminMe } from '@/services/api'

interface AdminUser {
  id: number
  name: string
  email: string
  role: string // 'admin' | 'photographer' | 'client'
}

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    user: null as AdminUser | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async initialize() {
      try {
        const data = await fetchAdminMe()
        this.user = data.data // depending on your UserResource shape
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },
    async login(email: string, password: string) {
      const data = await adminLogin(email, password)
      this.user = data.data
    },
    async logout() {
      await adminLogout()
      this.user = null
    },
  },
})
```

- State is derived from server state, not localStorage tokens, since cookies + session handle auth; you can still cache minimal flags if desired.
- `initialize()` runs once on app startup to restore the logged‑in admin if the session is still valid.

***

## Step 6: Vue Router routes and guards

1. **Define admin routes with meta flags:**

```ts
// resources/js/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuthStore } from '@/stores/adminAuth'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboardView from '@/views/admin/DashboardView.vue'
import AdminLoginView from '@/views/admin/LoginView.vue'

const routes = [
  {
    path: '/admin/login',
    name: 'admin.login',
    component: AdminLoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin.dashboard',
        component: AdminDashboardView,
      },
      // other admin children...
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

2. **Global navigation guard:**

```ts
// resources/js/router/guards.ts (or inline in index.ts)

router.beforeEach(async (to, from, next) => {
  const authStore = useAdminAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'admin.login',
      query: { redirect: to.fullPath },
    })
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'admin.login' })
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'admin.dashboard' })
  }

  next()
})
```

- This pattern (initialize store, then check meta flags) is a standard, testable way to secure Vue 3 routes with Pinia.
- You can unit‑test the guard in isolation as shown in modern Vue Router testing examples.

***

## Step 7: Admin login view (Vue)

A minimal Composition API login view using the store:

```vue
<!-- resources/js/views/admin/LoginView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthStore } from '@/stores/adminAuth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const onSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || { name: 'admin.dashboard' }
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login">
    <form @submit.prevent="onSubmit">
      <h1>Admin Login</h1>
      <p v-if="error" class="text-red-500">{{ error }}</p>
      <input v-model="email" type="email" autocomplete="username" required />
      <input v-model="password" type="password" autocomplete="current-password" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Login' }}
      </button>
    </form>
  </div>
</template>
```

- Use proper `autocomplete` attributes and avoid logging passwords anywhere.

***

## Step 8: Security best practices for admin access

- **Use cookies + CSRF (Sanctum SPA mode), not localStorage tokens**, to avoid XSS‑enabled token theft and to get built‑in CSRF protection.
- **Rate‑limit login attempts** using Laravel’s `ThrottleRequests` middleware or Fortify‑style throttling to slow brute‑force attacks.
- **Enforce HTTPS and secure cookie flags** (`secure`, `httpOnly`, `SameSite=Lax/Strict`) in production so session cookies cannot be read via JavaScript or sent cross‑site easily. 
- **Centralize authorization:** keep admin checks in middleware/gates and policies, not sprinkled across controllers, matching your “controller dumb, service/policy smart” architecture.
- **Audit & logging:** log admin logins and sensitive admin actions server‑side for traceability; consider 2FA for admin accounts if you later integrate a package.  

***

