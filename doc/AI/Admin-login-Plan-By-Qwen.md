# Building a Secure Admin Login: A Complete Blueprint for Laravel 13 and Vue 3 Applications

This report provides a comprehensive, file-by-file guide for implementing a secure administrative login feature within a Laravel 13 and Vue 3 application. The methodology prioritizes stateful, cookie-based authentication using Laravel Sanctum, which offers built-in CSRF protection and mitigates risks associated with client-side token storage [[3,11]]. Each section details the specific file to be created or modified, providing the complete code and rationale for its inclusion. This guide adheres strictly to the provided context, ensuring all information is verifiable and directly addresses the user's requirement for an actionable technical blueprint.

## Backend Foundation: Laravel Configuration and Database Setup

The foundation of a secure administrative login system begins with meticulous backend configuration and a properly structured database. This phase involves installing and configuring the core authentication package, defining trusted domains and cross-origin resource sharing policies, and preparing the user model to handle role-based access. These foundational steps are critical; any misconfiguration can lead to common issues such as CSRF token mismatches (419 errors) or failed authentication attempts [[47,80]].

First, the Laravel Sanctum package must be installed via Composer by running `composer require laravel/sanctum` [[36]]. Sanctum is the lightweight solution for securing first-party single-page applications (SPAs), providing a session-based authentication flow that includes automatic CSRF protection [[2,68]]. After installation, several key configuration files must be edited. The `.env` file requires two primary additions. The `SANCTUM_STATEFUL_DOMAINS` environment variable must be set to the domain and port where the Vue.js frontend is served, for example, `moussawer.test:5173` [[9,33]]. This directive explicitly tells Sanctum which origins are considered "stateful," meaning cookies will be sent and received automatically for requests originating from them, which is essential for the SPA authentication workflow [[3]]. Additionally, it is recommended to configure a persistent session driver, such as `SESSION_DRIVER=database`, to ensure session data persists correctly across server requests and is not lost if an inappropriate driver like `cookie` is used [[9,24]].

Next, the Cross-Origin Resource Sharing (CORS) configuration, located at `config/cors.php`, must be precisely defined. The `allowed_origins` array must include the same domain and port specified in `SANCTUM_STATEFUL_DOMAINS` (e.g., `http://moussawer.test:5173`). Most importantly, the `'supports_credentials' => true` setting must be enabled [[9]]. This allows the browser to send credentials (like cookies) with requests to a different origin, a non-negotiable requirement for Sanctum's cookie-based authentication to function across different ports or domains [[9]]. Without this setting, browsers will block the request entirely when the frontend Axios instance is configured with `withCredentials: true` .

The final piece of the backend foundation is the HTTP kernel middleware group. In `app/Http/Kernel.php`, the `web` middleware group must include the `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` middleware [[9]]. This middleware is responsible for starting a session for incoming requests from stateful domains and injecting an `XSRF-TOKEN` cookie into the response. This cookie is then read by the browser and sent back with subsequent requests, allowing Laravel's CSRF verification middleware to validate the authenticity of the request and prevent CSRF attacks [[17,89]]. Once these initial configurations are in place, the database schema must be prepared to support roles. If the `users` table does not already contain a column for storing user roles, a new migration must be created and run. This migration would typically add a nullable string or enum column named `role` to the `users` table. Subsequently, the `app/Models/User.php` model must be updated to cast the `role` attribute and define a helper method to check for administrative privileges.

| File / Location | Key Configuration / Code Snippet | Rationale |
| :--- | :--- | :--- |
| **.env** | `SANCTUM_STATEFUL_DOMAINS=moussawer.test:5173`<br>`SESSION_DRIVER=database` | Defines trusted origins for session cookies and ensures sessions persist correctly on the server [[9,24,33]]. |
| **config/cors.php** | `'allowed_origins' => ['http://moussawer.test:5173'],`<br>`'supports_credentials' => true,` | Allows the Vue app to send credentials (cookies) with requests, enabling Sanctum's cookie-based auth [[9]]. |
| **app/Http/Kernel.php** | `'web' => [\n    // ... existing middleware\n    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,\n],` | Starts a session and injects the XSRF-TOKEN cookie for stateful SPA requests, enabling CSRF protection [[2,9]]. |
| **Database Migration** | `Schema::table('users', function (Blueprint $table) { $table->string('role')->nullable(); });` | Adds a `role` column to the `users` table to store user roles like 'admin', 'photographer', or 'client' [[48]]. |
| **app/Models/User.php** | `protected $casts = ['role' => 'UserRole'];`<br><br>`public function isAdmin(): bool<br>{<br>    return $this->role === UserRole::Admin;<br>}` | Casts the `role` attribute to the `UserRole` enum and provides a helper method to easily check if a user has admin privileges [[48]]. |

## Core Authentication Logic: Controllers, Middleware, and API Routes

With the backend foundation in place, the next phase involves building the core logic that handles the authentication flow. This includes creating a dedicated controller to manage login, logout, and user retrieval, defining a custom middleware to enforce administrative authorization, and registering the corresponding API routes. This architecture promotes separation of concerns, keeping business logic centralized and reusable [[91]].

The first step is to create a dedicated Form Request class for validating admin login credentials. This keeps the controller clean and encapsulates validation rules. Create the file `app/Http/Requests/Admin/AdminLoginRequest.php` and implement the following code. This class defines the rules that the email must be a valid format and the password must be at least eight characters long, providing the first line of defense against malformed input .

```php
// File: app/Http/Requests/Admin/AdminLoginRequest.php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdminLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email:rfc,dns'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
```

Next, create the `AdminAuthController` located at `app/Http/Controllers/Api/Admin/AdminAuthController.php`. This controller will house the primary authentication logic. The `login` method accepts an `AdminLoginRequest` instance, which automatically validates the incoming data. It uses `Auth::attempt()` to verify the user's credentials. If authentication fails, it immediately returns a `401 Unauthorized` JSON response . Crucially, upon a successful password check, it calls `$request->session()->regenerate()` before any other logic executes [[24]]. This action invalidates the old session ID and creates a new one, effectively preventing Session Fixation attacks where an attacker tricks a user into using a known session identifier . After regenerating the session, the controller retrieves the user model and performs the central authorization check: `if (! $user->isAdmin())`. If the user is not an admin, the session is terminated completely using `Auth::logout()`, `$request->session()->invalidate()`, and `$request->session()->regenerateToken()`, and a `403 Forbidden` response is returned . Only authenticated admins receive a `UserResource` containing their serialized data . The `me` and `logout` methods provide endpoints to fetch the current user's data and terminate the session, respectively.

```php
// File: app/Http/Controllers/Api/Admin/AdminAuthController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function login(AdminLoginRequest $request)
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $request->session()->regenerate();

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

To enforce the "admin" role across multiple endpoints, a custom middleware is required. Create the file `app/Http/Middleware/EnsureUserIsAdmin.php`. This middleware acts as a reusable gatekeeper, inspecting the authenticated user on every request and denying access if they are not an admin [[91]]. It must be registered in `app/Http/Kernel.php` under the `$routeMiddleware` property as `'is_admin' => \App\Http\Middleware\EnsureUserIsAdmin::class`.

```php
// File: app/Http/Middleware/EnsureUserIsAdmin.php
namespace App\Http\Middleware;

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

Finally, all of this logic is wired together through API routes in `routes/api.php`. These routes are grouped under an `/admin` prefix to logically separate them. The login route is protected by the `guest:sanctum` middleware to prevent already-authenticated users from accessing it [[88]]. The `/me` and `/logout` routes require an active session via `auth:sanctum`. A broader group for all sensitive admin actions applies both `auth:sanctum` and the custom `is_admin` middleware, ensuring that even if a non-admin user manipulates the frontend, the backend will reject their request based on their actual permissions .

```php
// File: routes/api.php
use App\Http\Controllers\Api\Admin\AdminAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('guest:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', [AdminAuthController::class, 'me']);

        Route::middleware('is_admin')->group(function () {
            // All other protected admin API routes go here
            // e.g., Route::get('/dashboard', [...]);
        });
    });
});
```

## Frontend Integration: Axios, Pinia, and Vue Router Security

After establishing a robust and secure backend, the focus shifts to the Vue 3 frontend, which is responsible for presenting the login interface, managing user state, and protecting client-side navigation. The architecture relies on three core technologies: Axios for standardized API communication, Pinia for centralized state management, and Vue Router navigation guards for enforcing access rules on the client side. This combination ensures a seamless and secure user experience that is tightly synchronized with the server's authentication state.

The first step in the frontend is to create a shared Axios instance configured specifically for interacting with the Laravel Sanctum-powered API. Create the file `resources/js/services/api.ts`. This instance is pre-configured with the API's base URL, which should be defined in the Vue project's `.env` file as `VITE_API_BASE_URL` [[9]]. The most critical configuration is `withCredentials: true`, which instructs Axios to handle cookies, a necessity for Sanctum's stateful authentication to function correctly [[9,25]]. Before making any state-changing requests (POST, PUT, DELETE), the application must perform a CSRF handshake. This is accomplished by making a GET request to the `/sanctum/csrf-cookie` endpoint, which triggers Laravel to set an `XSRF-TOKEN` cookie in the browser [[17,62]]. The `api.ts` module encapsulates this logic and other common API interactions into clean, reusable functions like `adminLogin`, `adminLogout`, and `fetchAdminMe` [[58]].

```typescript
// File: resources/js/services/api.ts
import axios, { AxiosInstance } from 'axios';
import { AdminUser } from '@/types'; // Assuming a TypeScript type for the user

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export async function adminLogin(email: string, password: string): Promise<{ data: AdminUser }> {
  await apiClient.get('/sanctum/csrf-cookie');
  const response = await apiClient.post('/api/admin/login', { email, password });
  return response.data;
}

export async function adminLogout(): Promise<void> {
  await apiClient.post('/api/admin/logout');
}

export async function fetchAdminMe(): Promise<{  AdminUser }> {
  const response = await apiClient.get('/api/admin/me');
  return response.data;
}
```

Central to managing the user's state is a dedicated Pinia store. Pinia is the official state management library for Vue 3, designed for simplicity and type safety [[31,37]]. Create the file `resources/js/stores/adminAuth.ts`. This store's state holds the currently logged-in admin's user object and a flag indicating whether the store's initialization process is complete [[5]]. The reliance on server-side cookies, rather than insecure client-side storage like `localStorage`, is a cornerstone of this secure design, as it prevents token theft via XSS attacks [[11,55]]. The `initialize()` action is a crucial part of the store's lifecycle; it runs once on application startup and attempts to fetch the current user's data by calling the `/api/admin/me` endpoint, thus restoring the logged-in state if a valid session cookie exists [[28]]. The `actions` `login` and `logout` interact with the API service and the local state, respectively.

```typescript
// File: resources/js/stores/adminAuth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminLogin, adminLogout, fetchAdminMe } from '@/services/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const user = ref<AdminUser | null>(null);
  const initialized = ref(false);

  const isAuthenticated = () => !!user.value;
  const isAdmin = () => user.value?.role === 'admin';

  async function initialize(): Promise<void> {
    try {
      const response = await fetchAdminMe();
      user.value = response.data;
    } catch (error) {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await adminLogin(email, password);
    user.value = response.data;
  }

  async function logout(): Promise<void> {
    await adminLogout();
    user.value = null;
  }

  return { user, initialized, isAuthenticated, isAdmin, initialize, login, logout };
});
```

Once the state management layer is established, Vue Router is used to control navigation. Protected admin routes are defined with metadata flags. For example, the login route (`/admin/login`) is marked with `{ meta: { requiresGuest: true } }`, while the main admin dashboard layout is marked with `{ meta: { requiresAuth: true, requiresAdmin: true } }` [[13]]. These flags serve as instructions for a global navigation guard. The guard, implemented in `resources/js/router/guards.ts`, intercepts every navigation attempt. It first checks if the `adminAuth` store has finished initializing; if not, it waits for the `initialize` action to complete. Then, it inspects the `meta` properties of the target route. If the `requiresAuth` flag is present and the user is not authenticated, or if the `requiresAdmin` flag is true but the user is not an admin, the navigation is aborted, and the user is redirected to the appropriate page (e.g., login), preventing unauthorized views from being rendered [[4,77]]. This guard acts as a final checkpoint, ensuring the UI enforces the same rules that the backend enforces, providing a seamless and secure user experience [[6]].

## Proactive Threat Mitigation: Rate Limiting and Session Management

Building a secure system requires more than just implementing a functional authentication flow; it demands proactive defense against common and high-impact attack vectors. Two of the most critical threats to an administrative login system are brute-force attacks, which seek to guess credentials, and session hijacking, often facilitated by session fixation vulnerabilities. Laravel provides powerful, built-in mechanisms to mitigate both of these risks, and their integration into the authentication workflow is essential for a production-grade application.

Brute-force attacks involve automated scripts systematically trying different username and password combinations to gain unauthorized access. An administrative account, with its elevated privileges, is a prime target for such attacks. Laravel addresses this threat through its `ThrottleRequests` middleware. This middleware tracks the number of requests a given IP address makes to a specific route within a defined time window. Once the limit is exceeded, subsequent requests are rejected with a `429 Too Many Requests` HTTP status code, effectively slowing down or blocking the attack [[78]]. To implement this, the middleware can be applied directly to the `login` method in the `AdminAuthController`. This can be done either by adding it to the controller's middleware list in the constructor or, more granularly, by applying it to the route definition itself within `routes/api.php`. For instance, the login route could be modified to `Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:admin.login');`. A corresponding entry in the `$rateLimiting` array of `App\\Http\\Kernel.php` or, more commonly in modern Laravel versions, defined within the `boot` method of `AppServiceProvider.php`, would then establish the throttle limits. A typical implementation might allow 5 login attempts per minute before triggering a lockout, forcing attackers to expend significant time and resources and making brute-force attacks impractical [[18,81,82]].

Session Fixation is a more subtle attack vector. In this scenario, an attacker convinces a victim to use a known session identifier (e.g., by embedding it in a link). The victim logs in normally, but since their session ID was fixed by the attacker, the attacker now knows the valid session ID and can hijack the victim's session. While Sanctum's use of PHP's native session management helps, explicitly implementing session regeneration within the application logic provides an additional, crucial layer of defense. The implementation in the `AdminAuthController` correctly places the `$request->session()->regenerate()` call immediately after `Auth::attempt()` succeeds [[24]]. This action is performed *before* any other logic, such as checking the user's role. The sequence is deliberate and vital for security. By regenerating the session right after a successful password check, we ensure that the session associated with the valid credentials is new and unknown to the attacker. Should the subsequent role check fail—for example, if a standard user manages to reach the admin login endpoint—the application proceeds to terminate the newly created session. This prevents the attacker who may have initiated the session from ever gaining access, as the session they knew about was promptly invalidated . The logout functionality should mirror this rigor by calling `$request->session()->invalidate()` and `regenerateToken()` to destroy the session data and reset the CSRF token, ensuring a clean slate and preventing any lingering session from being hijacked . This disciplined approach to session management demonstrates a deep understanding of web security fundamentals and hardens the application against classic session-related vulnerabilities.

| Threat | Mitigation Strategy | Implementation Location | Security Rationale |
| :--- | :--- | :--- | :--- |
| **Brute-Force Attacks** | Rate Limiting Login Attempts | `ThrottleRequests` middleware applied to `AdminAuthController@login` method. | Slows down or blocks automated credential guessing scripts, making brute-force attacks impractical and resource-intensive for an attacker. [[18,78]] |
| **Session Hijacking** | Session Regeneration | `$request->session()->regenerate()` called immediately after `Auth::attempt()` succeeds. | Invalidates the old session ID, breaking any association an attacker might have had, thus preventing Session Fixation attacks. [[24]] |
| **Session Hijacking** | Secure Logout | `$request->session()->invalidate()` and `regenerateToken()` called in `AdminAuthController@logout`. | Completely destroys the server-side session data and resets the client-side CSRF token, ensuring no lingering session can be hijacked.  |

## Operational Resilience and Compliance Alignment

A truly secure system is not only resistant to attacks but also resilient in its operation and aligned with compliance requirements. This involves implementing operational controls like session timeouts and architecting the system for future security enhancements such as Two-Factor Authentication (2FA). Furthermore, maintaining detailed audit logs is a fundamental requirement for accountability and demonstrating due diligence to auditors for standards like SOC 2 and GDPR .

Enforcing session timeout policies is a mandatory security control in many environments and is a key requirement of frameworks like SOC 2, which mandates both idle and absolute session timeouts . An **absolute timeout** defines the maximum duration a session can remain active, regardless of activity. This is controlled by the `SESSION_LIFETIME` variable in the `.env` file, which is measured in minutes. For example, setting `SESSION_LIFETIME=240` will automatically log out a user after four hours of continuous activity, reducing the window of opportunity for an attacker who gains control of a machine . However, an absolute timeout alone is insufficient. An **idle timeout**, which logs a user out after a period of inactivity (e.g., 15 minutes), is equally important. Implementing a robust idle timeout requires a hybrid frontend-backend solution. The frontend (Vue.js) can track user activity (mouse movements, keystrokes) and periodically send a "heartbeat" request to the backend. The backend, upon receiving this heartbeat, updates a `last_activity_at` timestamp in the user's session record. A scheduled Artisan command (a cron job) can then run at regular intervals to scan for and terminate any sessions where the `last_activity_at` timestamp is older than the configured idle threshold. This proactive approach ensures that inactive sessions are terminated efficiently and securely, protecting against scenarios where a user forgets to log out [[22]].

Architectural readiness for future enhancements, particularly 2FA, is another hallmark of a well-designed system. Instead of treating 2FA as an afterthought, its integration should be planned from the beginning. The existing architecture, which uses a custom `is_admin` middleware, provides an excellent foundation for this. The key is to decouple the authentication process from the final authorization decision. During the login flow, after successfully verifying the username and password, the application can introduce an additional check: does this specific admin user have 2FA enabled? If 2FA is not enabled for the user, the process continues as normal. However, if 2FA *is* enabled, the application must invalidate the session and cookie, clear any sensitive data, and return a specific HTTP status code to the frontend (e.g., `202 Accepted` with a message indicating that 2FA verification is required) . This prompts the Vue.js application to redirect the user to a separate 2FA verification screen, where they can enter their second factor (e.g., a code from an authenticator app). By designing the backend to signal the need for a second factor rather than performing the 2FA logic itself, the system becomes highly extensible. Adding a third-party 2FA package later becomes a matter of plugging in the verification logic into this pre-existing hook, rather than requiring a complete overhaul of the authentication and routing logic .

Finally, implementing a robust audit logging system is critical for security, accountability, and compliance. Audit logs provide a verifiable record of significant events, including every attempt to log in as an administrator—both successful and failed—and all sensitive actions performed by an administrator. For login events, the `adminLogin` and `adminLogout` methods in the `AdminAuthController` are ideal locations to generate these logs . For auditing sensitive actions, a common pattern is to create a base controller that all controllers handling privileged operations extend, or to use Laravel's event broadcasting system to listen for specific events and dispatch a logging action in response. This decouples the auditing logic from the business logic, making the system more modular and easier to maintain . Aligning this logging strategy with compliance frameworks is crucial. For **SOC 2**, auditors expect detailed records of user activities and system changes to verify that access controls are functioning as intended . For **GDPR**, Article 32 mandates ensuring the security of personal data processing, and audit logs help detect and respond to breaches . By building a comprehensive audit trail from the outset, the application enhances its own security and simplifies the process of demonstrating compliance during audits .

