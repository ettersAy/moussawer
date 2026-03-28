# 🚀 Developer Command Guide

This guide contains the most common commands used in this project. All backend commands are prefixed with `./vendor/bin/sail` as we use Laravel Sail for Dockerized development.

---

## 🏗️ Environment & Setup

Manage the Docker environment and container status.

```bash
./vendor/bin/sail up -d             # Start all containers in background
./vendor/bin/sail stop              # Stop all containers
./vendor/bin/sail down              # Stop and remove containers, networks, and images
./vendor/bin/sail build --no-cache  # Force rebuild all containers
./vendor/bin/sail shell             # Enter the application container shell
./vendor/bin/sail logs -f           # Follow the application logs
./vendor/bin/sail composer [args]   # Run composer commands inside the container
```

---

## 🏗️ Composer (PHP Dependencies)

Manage Laravel packages and dependencies.

```bash
./vendor/bin/sail composer install  # Install dependencies from composer.lock
./vendor/bin/sail composer update   # Update all dependencies to latest compatible versions
./vendor/bin/sail composer require [package] # Add a new PHP package
./vendor/bin/sail composer dump-autoload -o   # Regenerate the class map
```

---

## 🛠️ PHP Artisan Essentials

Laravel's command-line interface for common development tasks.

```bash
./vendor/bin/sail artisan tinker    # Start interactive REPL for PHP/Laravel
./vendor/bin/sail artisan about     # Overview of app configuration and environment
./vendor/bin/sail artisan list      # List all available artisan commands
```

### ✨ Generate Components

```bash
./vendor/bin/sail artisan make:controller [Name]Controller        # Create a Controller
./vendor/bin/sail artisan make:model [Name] -m                     # Create Model with Migration
./vendor/bin/sail artisan make:request [Name]Request               # Create Form Request
./vendor/bin/sail artisan make:resource [Name]Resource             # Create API Resource
./vendor/bin/sail artisan make:factory [Name]Factory               # Create Model Factory
./vendor/bin/sail artisan make:seeder [Name]Seeder                 # Create Database Seeder
./vendor/bin/sail artisan make:mail [Name]Email                    # Create Mailable class
```

---

## 🗄️ Database & Migrations

Commands for managing schema and sample data.

```bash
./vendor/bin/sail artisan migrate           # Run pending migrations
./vendor/bin/sail artisan migrate:status    # Check status of migrations
./vendor/bin/sail artisan migrate:rollback  # Rollback last migration batch
./vendor/bin/sail artisan migrate:fresh     # Drop all tables and re-run all migrations
./vendor/bin/sail artisan migrate:fresh --seed # Fresh migration + seed database
./vendor/bin/sail artisan db:seed           # Run database seeders
./vendor/bin/sail artisan db:wipe           # Drop all tables, views, and types
```

---

## 🎨 Frontend (Vue / Vite)

Commands for asset compilation and development.

```bash
npm install         # Install JavaScript dependencies
npm run dev         # Start Vite development server (HMR)
npm run build       # Build assets for production
npm run lint        # Run ESLint to check for code quality issues
./vendor/bin/sail npm [args]  # Run npm commands inside the container
```

---

## 🧪 Testing & Quality

Ensuring the application works as expected.

```bash
./vendor/bin/sail artisan test                       # Run all tests
./vendor/bin/sail artisan test --parallel            # Run tests in parallel
./vendor/bin/sail artisan test --filter=[Name]Test   # Run a specific test class
./vendor/bin/sail artisan test --coverage            # Run tests with coverage (requires Xdebug)
```

---

## 🎭 E2E Tests (Playwright)

Browser-level tests that test the full stack (UI → API → DB).
> **Requires** both `./vendor/bin/sail up -d` and `npm run dev` to be running.

```bash
npm run test:e2e                  # Run all E2E tests (headless Chromium)
npm run test:e2e:ui               # Open Playwright's interactive UI mode
npm run test:e2e:report           # Open the last HTML test report
npx playwright test --list        # List all discovered tests (no execution)
npx playwright test contact       # Run only the contact page tests
npx playwright test --debug       # Run with the Playwright inspector (step-by-step)
npx playwright test --headed      # Run with a visible browser window
PLAYWRIGHT_BASE_URL=http://localhost:8000 npm run test:e2e  # Override app URL
```

---

## 🧹 Maintenance & Cache

Commands for clearing caches and optimizing performance.

```bash
./vendor/bin/sail artisan optimize:clear    # Clear ALL caches (config, route, view, etc.)
./vendor/bin/sail artisan config:cache      # Cache configuration for speed
./vendor/bin/sail artisan route:cache       # Cache routes for speed
./vendor/bin/sail artisan view:clear        # Clear compiled blade/view files
./vendor/bin/sail artisan cache:clear       # Clear application cache
```

---

## 📬 API Snippets (CURL)

Useful manual test commands for the API.

### Send Contact Form

```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "message": "Hello from developer console!"}'
```

### List Contact Submissions

```bash
curl -X GET http://localhost:8000/api/contact -H "Accept: application/json"
```

---

## 💡 Pro Tips

- **Mailpit**: Access the local email inbox at [http://localhost:8025](http://localhost:8025) while Sail is running.
- **Database GUI**: You can connect to the database on `localhost:3306` (MySQL) or `localhost:5432` (PostgreSQL) using credentials from your `.env` file.
- **Vite Port**: The frontend development server usually runs on [http://localhost:5173](http://localhost:5173).
