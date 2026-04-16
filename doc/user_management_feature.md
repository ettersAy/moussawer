# Admin User Management Feature Guide

This document outlines the architecture and specifics of the Admin User Management feature (CRUD) within the Moussawer platform. 

## Architectural Overview

The feature follows a classic API-driven separation of concerns. It is divided into an independent backend module utilizing Laravel Services and Resources, and a reactive frontend using Vue 3 Composition API.

### 1. Controllers and API (`app/Http/Controllers/Api/Admin/UserController.php`)
The entry point for all API requests. 
- **Responsibility:** Ensure security and handle HTTP transport.
- **Authorization:** `abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);` ensures the endpoint is strictly locked behind Admin boundaries.
- **Form Requests:** Utilizes `StoreUserRequest` and `UpdateUserRequest` to intercept validation payload concerns prior to entering controller logic.

### 2. Service Layer (`app/Services/UserService.php`)
The core repository of domain operations.
- Contains the `getAllPaginated($perPage, $search)` method which queries the `User` instances.
- Allows decoupled maintenance for User creation, password hashing, and DB transaction updates.

### 3. API Resources (`app/Http/Resources/UserResource.php`)
- Standardizes the JSON payload output.
- Eliminates the risk of exposing sensitive data (e.g., omitting raw passwords or secret tokens) while keeping formatting strictly controlled.

### 4. Client Presentation (`resources/js/views/admin/UsersView.vue`)
A Vue 3 setup script view embedded in the `AdminLayout`.
- Uses `ref` to manage complex internal state without Pinia. 
- Debounced search logic dynamically refuels `fetchUsers()` queries.
- Incorporates an elegant floating Toast Notification system spanning `success` and `error` parameters dynamically.
- Interacts purely with `/admin/users` API endpoint to handle standard lifecycle workflows via Axios interceptors.

## How to Update or Fix the Feature

If another developer needs to expand upon this, follow this workflow:

### **Scenario A: Adding a new user field (e.g., 'Status')**
1. **Migration:** Create the DB migration to push your new column.
2. **Form Requests:** Validate the new `status` field securely inside `StoreUserRequest` & `UpdateUserRequest`.
3. **Model:** Add `'status'` to the `$fillable` array in `app/Models/User.php`.
4. **API Resource:** Cast the new row securely within `UserResource` if required for the frontend.
5. **Vue Table:** Add the matching `<th>` and interpolating `<td>` logic in `UsersView.vue`.
6. **Vue Form:** Append an input field mapped to `form.status` inside the `users-view` modal element.

### **Scenario B: Debugging Pagination Issues**
If the frontend claims metadata is missing:
1. Ensure the controller returns a `ResourceCollection::class` natively, avoiding raw array JSON conversions. Laravel handles `$users->paginate()` metadata seamlessly exclusively when returning `FooResource::collection($paginator)`.
2. Ensure you extract properties dynamically mapping from `response.data.meta.total` inside the `fetchUsers()` async implementation logic.
