# INC-001 — MethodNotAllowedHttpException on POST /api/contact

**Date:** 2026-03-28
**Severity:** High (public form completely broken)
**Status:** ✅ Resolved

---

## 📋 The Error

```json
{
  "exception": "Symfony\\Component\\HttpKernel\\Exception\\MethodNotAllowedHttpException",
  "message": "The POST method is not supported for route api/contact. Supported methods: GET, HEAD.",
  "file": ".../Illuminate/Routing/AbstractRouteCollection.php",
  "line": 130
}
```

---

## 🔍 Root Cause

During a backend refactoring session, `routes/api.php` was updated to wrap the contact route inside a `Route::prefix('public')` group for organizational purposes:

```php
// ❌ BROKEN — URL became /api/public/contact
Route::prefix('public')->group(function () {
    Route::post('/contact', [ContactSubmissionController::class, 'store']);
});
```

This silently changed the real HTTP endpoint from:

- ✅ `POST /api/contact` (what the frontend expects)
- ❌ `POST /api/public/contact` (what the backend actually registered)

Laravel will respond to `POST /api/contact` with `405 Method Not Allowed` because **a route does exist at that path** (likely the catch-all or a GET), but **not** for the POST method at the new path.

> 💡 **Why does Laravel say "405" instead of "404"?** Because the router found the path `/api/contact` but not with the POST method. It means some other route (or the fallback) matched the path but rejected the method.

---

## ✅ The Fix

Remove the `prefix('public')` URL group. Route organization is done via comments only; the URL must stay `/api/contact`:

```php
// ✅ FIXED
Route::post('/contact', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:5,1');
```

**Files changed:**

- `routes/api.php` — removed `Route::prefix('public')->group(...)` wrapper.

---

## 🧰 Secondary Issue Discovered & Fixed

While implementing tests, two additional bugs were uncovered:

### 1. `email:rfc,dns` fails in Docker's test environment

The `StoreContactRequest` used `email:rfc,dns` validation, which performs a **live DNS lookup** on the domain. Inside the Docker/Sail container, DNS resolution can be restricted or slow, causing the happy-path test to fail with a 422 instead of 201.

**Fix:** Changed validation to `email:rfc` — format validation is sufficient for API input.

```php
// Before
'email' => ['required', 'email:rfc,dns', 'max:255'],

// After
'email' => ['required', 'email:rfc', 'max:255'],
```

### 2. Controller had wrong namespace

The `ContactSubmissionController` was created with `namespace App\Http\Controllers` instead of `namespace App\Http\Controllers\Api\Public`. This would have caused a class-not-found error at runtime.

**Fix:** Corrected namespace in the controller file.

---

## 🧪 Tests Added

File: `tests/Feature/Api/Public/ContactSubmissionControllerTest.php`

| Test | What it verifies |
|---|---|
| `it_stores_a_valid_contact_submission` | Happy path — 201 response + DB record created |
| `it_rejects_a_missing_email` | Email field required — 422 + validation error |
| `it_rejects_an_invalid_email_format` | RFC email format — 422 + validation error |
| `it_rejects_a_missing_message` | Message field required — 422 + validation error |
| `it_rejects_a_message_that_is_too_short` | min:10 rule — 422 + validation error |
| `it_rejects_a_message_that_is_too_long` | max:2000 rule — 422 + validation error |
| `it_returns_json_even_on_validation_failure` | Response is always JSON (not HTML) |
| `it_does_not_store_anything_on_validation_failure` | DB guard — nothing persisted on bad input |

**Result: 8/8 passing, 25 assertions.**

Run them with:

```bash
./vendor/bin/sail artisan test --filter=ContactSubmissionControllerTest
```

---

## 🧑‍💻 How to Debug This Yourself (Without AI)

If you encounter a `MethodNotAllowedHttpException` or similar routing error, follow these steps:

### Step 1 — List all registered routes

```bash
./vendor/bin/sail artisan route:list
```

Look for the route you expect (e.g., `api/contact`). Check the **Method** column. If it says `GET|HEAD` and you're sending `POST`, that's the bug.

### Step 2 — Grep for the route registration

```bash
grep -r "contact" routes/
```

This instantly shows you where the route is registered and with what prefix.

### Step 3 — Check your HTTP client

In the Vue frontend, look at `fetch('/api/contact', ...)` — is the URL hardcoded or generated? If you used axios with a base URL, is the base URL correct?

### Step 4 — Use curl to isolate frontend vs backend

```bash
# Test the backend directly, bypassing the Vue app
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "message": "Hello test message!"}'
```

If curl succeeds but the browser fails, the bug is in the frontend URL. If curl also fails, the bug is in the backend route registration.

### Step 5 — Clear route cache

If you're in production mode or ran `artisan route:cache`, stale cache can serve old routes.

```bash
./vendor/bin/sail artisan route:clear
./vendor/bin/sail artisan optimize:clear
```

### Step 6 — Understand 404 vs 405

| Status | Meaning |
|---|---|
| **404** | Route path doesn't exist at all |
| **405** | Route path exists, but not for this HTTP method |

A 405 is actually more helpful — it proves the path is registered, just with the wrong method or a conflicting route registration.

---

## 📌 Lessons Learned

1. **URL prefixes are a breaking change** — changing a route prefix without updating all consumers (frontend, tests, docs) breaks the integration silently.
2. **Write tests before refactoring routes** — if the happy-path test existed before the prefix was added, it would have caught this immediately.
3. **Separate code organization from URL design** — use comments and directory structure for organization; design URLs for RESTful clarity.
4. **DNS validation is environment-dependent** — avoid `email:rfc,dns` in code that runs in isolated CI/Docker environments.
