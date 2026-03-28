# 📸 Moussawer - Photography Management Platform

## 🌟 Overview

Moussawer is a professional photography platform designed for **Photographers**, **Clients**, and **Administrators**. It prioritizes **security (SOLID principles)** and **premium UI/UX**.

### 🛠️ Tech Stack

- **OS:** Linux Mint
- **Platform:** Docker (Laravel Sail)
- **Backend:** Laravel 13 (API-First, JSON responses only)
- **Frontend:** Vue.js 3 (Composition API, Vite, Pinia)
- **Database:** MySQL (Managed via Adminer on port 8080)

---

## 🏗️ Project Architecture

### 1. Backend (Laravel API - SOLID Inspired)

The backend is strictly API-driven with a focus on type safety and separation of concerns.

```text
app/
├── Enums/                      # Strictly type your user roles (Admin, Photographer, Client)
│   └── UserRole.php
├── Http/
│   ├── Controllers/
│   │   └── Api/                # All backend responses are JSON
│   │       ├── Public/         # ContactController, HomeController
│   │       ├── Admin/          
│   │       ├── Photographer/   
│   │       └── Client/         
│   ├── Requests/               # [Security] Validation & Input Sanitization
│   │   └── StoreContactRequest.php
│   └── Resources/              # [Security] Data Transformation (Never expose raw DB models)
│       └── ContactSubmissionResource.php
├── Models/                     # Eloquent Entities
│   ├── User.php
│   └── ContactSubmission.php
├── Policies/                   # [Security] Authorization (Can User X do Y?)
│   └── ContactSubmissionPolicy.php
└── Services/                   # [SOLID] Business Logic (Controllers should be "dumb")
    └── ContactService.php

routes/                         # Root level (Standard for Laravel 11+)
├── api.php                     # Auth (Sanctum) and API endpoints
├── web.php                     # SPA Catch-all pointing to Vue
└── console.php
```

### 2. Frontend (Vue 3 Modular Architecture)

Role-based structure for maximum scalability and maintenance.

```text
resources/js/
├── app.js                 # Entry point
├── App.vue                # Root component
├── bootstrap.js
├── components             # Reusable UI (Nested by Role: admin, client, shared)
│   ├── admin
│   ├── client
│   ├── forms
│   ├── photographer
│   └── shared
│       └── Navbar.vue
├── composables           # Shared reactive logic
├── layouts               # Layout shells (AdminLayout, PublicLayout, BaseLayoutDispatcher)
│   ├── AdminLayout.vue
│   ├── AppLayout.vue
│   ├── BaseLayoutDispatcher.vue
│   ├── ClientLayout.vue
│   ├── PhotographerLayout.vue
│   └── PublicLayout.vue
├── router               #  Route definitions & guards
│   └── index.js
├── router.js
├── services              # API Abstraction (Axios)
├── stores                # Global State (Pinia)
└── views                 # Page components (admin/Dashboard, public/Home, etc.)
    ├── admin
    │   └── DashboardView.vue
    ├── client
    │   └── DashboardView.vue
    ├── photographer
    │   └── DashboardView.vue
    └── public
        ├── ContactView.vue
        └── HomeView.vue
```

---

## 🎯 Current Status & Next Steps

### **Current Progress**

✅ **Project Foundation:** Initialized Laravel Sail with Vue 3.
✅ **Architecture Defined:** Both Frontend and Backend folder structures established under SOLID principles.
✅ **Backend Fully Scaffolded & Implemented:**

- `Enums/UserRole.php` — Backed enum (`admin`, `photographer`, `client`) with label helper.
- `Models/User.php` — Casts `role` to `UserRole` enum; has `isAdmin()`, `isPhotographer()`, `isClient()` helpers.
- `Models/ContactSubmission.php` — Eloquent model with `$fillable` protection.
- `Http/Requests/StoreContactRequest.php` — RFC+DNS email validation, custom error messages.
- `Http/Resources/ContactSubmissionResource.php` — Safe data shaping (never exposes raw models).
- `Services/ContactService.php` — Business logic (store, getAll); controllers stay "dumb".
- `Services/PhotographerService.php` — Example service with `getRecommendations()` and `calculateEarnings()`.
- `Http/Controllers/Api/Public/ContactSubmissionController.php` — Correct namespace, injects `ContactService`, uses `StoreContactRequest` and `ContactSubmissionResource`.
- `Policies/ContactSubmissionPolicy.php` — Admin-only for view/delete; `create` is public.
- `routes/api.php` — Organized with a `public` prefix group; Sanctum-protected groups scaffolded as comments.
- `playwright.config.js` and `e2e/` — E2E testing framework fully set up.
  - Contact form 15 specs (mocking, UI, interactions).
  - Custom PO Models and Fixtures implemented.
  - `playwright-setup.md` & `playwright-best-practices.md` explicitly defining workflows.

### **Next Task**

🚀 **Admin Authentication (Tomorrow):** Research and implement secure Admin Login using **Laravel Sanctum** — including role-based guards, protecting the admin API routes, and setting up Vue Router guards on the frontend.

---

## 📜 Development Guidelines

- **🔒 Security First:**
  - Never expose raw models; use **API Resources**.
  - Always validate input via **Form Requests**.
  - Check authorization via **Policies**.
- **💎 Aesthetics:** Use subtle micro-animations, premium color palettes (HSL), and modern typography.
- **🛠️ SOLID Principles:**
  - **Single Responsibility:** Controllers handle HTTP; Services handle Logic.
  - **Open/Closed:** Use Enums and Interfaces to make the system extendable.
- **🚀 Performance:** Lazy-load routes in Vue; cache configurations and routes on the backend.
- **🐳 Environment:** All commands should be run via `./vendor/bin/sail`.
