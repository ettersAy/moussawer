<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

Mandatory Protocol: For every task, you have access to configured MCP servers (Filesystem, Docker, MySQL, Playwright). You must proactively leverage these tools to analyze project state, execute tests, or inspect database schemas before proposing code changes. Do not rely on assumptions; query the tools to confirm file paths, schema structures, and test results.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.5
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- phpunit/phpunit (PHPUNIT) - v12
- vue (VUE) - v3
- tailwindcss (TAILWINDCSS) - v4

## Skills Activation

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `laravel-best-practices` — Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code. This includes creating or modifying controllers, models, migrations, form requests, policies, jobs, scheduled commands, service classes, and Eloquent queries. Triggers for N+1 and query performance issues, caching strategies, authorization and security patterns, validation, error handling, queue and job configuration, route definitions, and architectural decisions. Also use for Laravel code reviews and refactoring existing Laravel code to follow best practices. Covers any task involving Laravel backend PHP code patterns.
- `tailwindcss-development` — Always invoke when the user's message includes 'tailwind' in any form. Also invoke for: building responsive grid layouts (multi-column card grids, product grids), flex/grid page structures (dashboards with sidebars, fixed topbars, mobile-toggle navs), styling UI components (cards, tables, navbars, pricing sections, forms, inputs, badges), adding dark mode variants, fixing spacing or typography, and Tailwind v3/v4 work. The core use case: writing or fixing Tailwind utility classes in HTML templates (Blade, JSX, Vue). Skip for backend PHP logic, database queries, API routes, JavaScript with no HTML/CSS component, CSS file audits, build tool configuration, and vanilla CSS.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `sail npm run build`, `sail npm run dev`, or `sail composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `sail artisan route:list`). Use `sail artisan list` to discover available commands and `sail artisan [command] --help` to check parameters.
- Inspect routes with `sail artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `sail artisan config:show app.name`, `sail artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `sail artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== sail rules ===

# Laravel Sail

- This project runs inside Laravel Sail's Docker containers. You MUST execute all commands through Sail.
- Start services using `sail up -d` and stop them with `sail stop`.
- Open the application in the browser by running `sail open`.
- Always prefix PHP, Artisan, Composer, and Node commands with `vendor/bin/sail` alias `sail`. Examples:
    - Run Artisan Commands: `sail artisan migrate`
    - Install Composer packages: `sail composer install`
    - Execute Node commands (run directly in the host machine): `npm run dev`
    - Execute PHP scripts: `sail php [script]`
- View all available Sail commands by running `vendor/bin/sail` without arguments.

## Persistent Sail Alias Configuration
**Critical for VS Code/Cline Integration:** VS Code terminals may run as login/non-interactive shells that don't source `.zshrc` properly. For permanent `sail` availability:

1. **Robust Sail Function** (preferred): Use a shell function instead of alias for better error handling and directory independence:
```bash
sail() {
    local sail_cmd
    if [ -f "./sail" ]; then
        sail_cmd="./sail"
    elif [ -f "./vendor/bin/sail" ]; then
        sail_cmd="./vendor/bin/sail"
    elif [ -f "/srv/dev/moussawer/vendor/bin/sail" ]; then
        sail_cmd="/srv/dev/moussawer/vendor/bin/sail"
    else
        echo "Error: sail command not found"
        echo "Looked for: ./sail, ./vendor/bin/sail, /srv/dev/moussawer/vendor/bin/sail"
        return 1
    fi
    sh "$sail_cmd" "$@"
}
```

2. **Configuration Files**: Add to both `~/.zshrc` (interactive shells) and `~/.zshenv` (all shells including non-interactive/login).

3. **Check for Conflicts**: Ensure no duplicate `sail` aliases/functions in shell config files.

=== shell-configuration-rules ===

# Shell Configuration Best Practices

## Zsh Configuration Files
- **`.zshenv`**: Always sourced - use for environment variables and functions needed everywhere
- **`.zshrc`**: Sourced for interactive shells - use for aliases, prompts, completion
- **`.zprofile`**: Sourced for login shells - use for login-specific setup
- **`.zlogin`**: Sourced after `.zshrc` for login shells

## VS Code Terminal Integration
- VS Code terminals often run as login shells (`zsh -l`)
- Ensure critical functions/aliases are in `.zshenv` for availability in all shell types
- Test with: `zsh -l -c "type sail"` to verify login shell availability

## Debugging Shell Issues
1. Check shell type: `echo $SHELL` and `ps -p $$ -o comm=`
2. Test in new shell: `zsh -c "type sail"`
3. Test in login shell: `zsh -l -c "type sail"`
4. Check config files: `grep -n "sail" ~/.zsh* ~/.bash*`

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `sail artisan test --compact` with a specific filename or filter.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `sail artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `sail artisan list` and check their parameters with `sail artisan [command] --help`.
- If you're creating a generic PHP class, use `sail artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `sail artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `sail artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `sail bin pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `sail bin pint --test --format agent`, simply run `sail bin pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This application uses PHPUnit for testing. All tests must be written as PHPUnit classes. Use `sail artisan make:test --phpunit {name}` to create a new test.
- If you see a test using "Pest", convert it to PHPUnit.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite to make sure everything is still passing.
- Tests should cover all happy paths, failure paths, and edge cases.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files; these are core to the application.

## Running Tests

- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `sail artisan test --compact`.
- To run all tests in a file: `sail artisan test --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `sail artisan test --compact --filter=testName` (recommended after making a change to a related file).

=== browser-automation rules ===

# Browser Automation Decision Framework

For browser automation tasks, automatically choose between MCP Playwright Server and Direct Playwright Installation:

- **Use MCP Playwright Server** for simple/exploratory tasks (1-3 actions, quick validation, screenshots, console inspection)
- **Use Direct Playwright Installation** for complex workflows (4+ actions), reusable scripts, or CI/CD integration

If chosen approach fails, fall back to the other. If both fail, report the error and suggest manual verification.

## Execution Protocol

### For MCP Playwright Server:
- Use available MCP tools (`playwright_navigate`, `playwright_fill`, etc.)
- Always use `headless: true` (see headless requirement section)
- Clean up any temporary resources after task completion

### For Direct Playwright Installation:
- Create script in `/scripts/` directory with descriptive name
- Use ES module syntax (`import` not `require`)
- Leverage existing page objects from `/e2e/pages/` when possible
- Include error handling and logging
- Clean up script file unless explicitly asked to keep it

=== tinker-enum-handling ===

# Tinker Enum Handling Guidelines

## Enum Casting in Models
When models use Enum casting (e.g., `protected $casts = ['role' => UserRole::class]`):

## Correct Usage Patterns
```php
// INCORRECT - Will fail with conversion error
echo $user->role;

// CORRECT - Access enum value
echo $user->role->value;

// CORRECT - Cast to string
echo (string) $user->role;

// CORRECT - Use enum methods
echo $user->role === UserRole::Client ? 'Client' : 'Other';
```

## Common Enums in This Project
- `UserRole::Admin`, `UserRole::Photographer`, `UserRole::Client`
- Always use `->value` for string representation in Tinker

## Tinker Output Requirement
- **Always use `echo`** for Tinker commands to ensure output display
- Example: `sail artisan tinker --execute 'echo User::count();'`

=== playwright-headless-requirement ===

# Playwright Headless Mode Requirement

## Environment Context
This project runs in environments without graphical display servers (X11). Playwright requires headless mode.

## Default Configuration
- **Always use `headless: true`** for Playwright MCP tools
- Headed mode (`headless: false`) will fail with "Missing X server or $DISPLAY"
- Exception: Only use headed mode if explicitly testing UI interactions in GUI environment

## Tool Usage Pattern
```javascript
// CORRECT - Always use in this environment
playwright_navigate(url: "http://localhost", headless: true)

// INCORRECT - Will fail
playwright_navigate(url: "http://localhost", headless: false)
```

## Fallback Strategy
If Playwright MCP fails:
1. Check if headless mode is enabled
2. Verify application is running (`sail up -d`)
3. Use HTTP tools directly for API testing

## Authentication Flow
### Login Process:
- **Endpoint:** `POST /api/login`
- **Returns:** User data + Sanctum token
- **Token Usage:** `Authorization: Bearer {token}`

### Profile Endpoints:
- Client: `POST/GET/PUT/DELETE /api/client/profile`
- Photographer: `POST/GET/PUT /api/photographer/profile`

### Portfolio Endpoints:
- Photographer: `GET/POST/PUT/DELETE /api/photographer/portfolios`
- Admin portfolio management: `GET /api/admin/users/{user}/portfolios`, `DELETE /api/admin/users/{user}/portfolios/{portfolio}`

=== mcp-server-status ===

# MCP Server Status & Best Practices

## Available Servers:
- **Playwright** - ✅ Working (requires headless mode)
- **Filesystem** - ✅ Working
- **MySQL** - ✅ Working (connection: 127.0.0.1:3306, sail/password, database: moussawer)
- **GitHub** - ✅ Working
- **Docker** - ✅ Working

## Database Access (Priority Order):
1. **Laravel Boost** (`database-query`, `database-schema`) — Best for Laravel-integrated queries
2. **MySQL MCP** (`mysql_query`) — Fastest for raw SQL and schema inspection
3. **Tinker** (`sail artisan tinker --execute`) — For complex Eloquent operations
4. **Sail MySQL** (`sail mysql -u sail -ppassword -e "QUERY"`) — For one-off commands

## MySQL MCP Quick Reference
- **JSON parsing errors**: Disable debug logging in wrapper script (`ENABLE_LOGGING=false`)
- **Connection timeout**: Verify MySQL is running (`sail up -d`)
- **Permission denied**: `chmod +x /path/to/wrapper.sh`
- For full installation guide: `/srv/dev/moussawer/doc/MYSQL_MCP_REINSTALLATION_GUIDE.md`

## General MCP Best Practices:
1. **Filesystem MCP**: Preferred over manual file operations
2. **Playwright MCP**: Use for HTTP requests and browser automation (always use headless mode)
3. **GitHub MCP**: Use for repository operations
4. **Docker MCP**: Use for container management

=== basic-project-info ===

# Basic Project Information

## Project Structure
- **Frontend**: Vue 3 SPA with Vite, located in `resources/js/`
- **Backend**: Laravel 13 API with Sanctum authentication
- **Database**: MySQL with Sail
- **Testing**: PHPUnit for backend, Playwright for E2E

## Common Commands Reference
- Start services: `./vendor/bin/sail up -d`
- Stop services: `./vendor/bin/sail stop`
- Run tests: `./vendor/bin/sail artisan test --compact`
- Build frontend: `npm run build`
- Run dev server: `npm run dev`
- Format PHP: `./vendor/bin/sail bin pint --dirty --format agent`

## Key Directories
- `app/Http/Controllers/Api/` - API controllers
- `app/Http/Resources/` - API resources (transformers)
- `resources/js/views/` - Vue components organized by role
- `resources/js/composables/` - Vue composables (reusable state logic)
- `tests/Feature/` - Feature tests

## Authentication & Roles
- Three user roles: `admin`, `photographer`, `client`
- Sanctum token-based authentication
- Login endpoint: `POST /api/login`
- Token usage: `Authorization: Bearer {token}`

## Common API Endpoints
- Client profile: `GET/PUT/DELETE /api/client/profile`
- Photographer profile: `GET/PUT /api/photographer/profile`
- Bookings: `GET/POST /api/bookings`, `POST /api/client/bookings`, `PATCH /api/bookings/{id}/status`, `DELETE /api/bookings/{id}`
- Photographer search (public): `GET /api/photographers`
- Photographer profile (public): `GET /api/photographers/{id}`

## Booking System Overview
- **Status lifecycle**: `pending → confirmed → completed` or `pending/confirmed → cancelled`
- **Authorization** (via `BookingPolicy`):
  - **Client**: Create bookings, view own, list own, delete pending only. Cannot update status.
  - **Photographer**: View assigned, list assigned, update status (confirm/complete/cancel). Cannot delete.
  - **Admin**: View all, list all, update any status, delete any.
- **Frontend routes**: `/client/bookings` (client list), `/photographers/{id}/book` (booking request), `/photographer/bookings` (photographer management)
- **Shared components**: `BookingsTable.vue` (role-based actions), `BookingFilters.vue` (status/sort)
- **Composables**: `useBookingForm.js` (booking form state), `useBookings.js` (bookings list CRUD)

## Test Accounts
- Client: `test@example.com` | `password`
- Admin: `admin@example.com` | `password` (may need password reset: `sail artisan tinker --execute 'echo \App\Models\User::where("email", "admin@example.com")->update(["password" => \Illuminate\Support\Facades\Hash::make("password")]);'`)
- Photographer: `photographer-one@example.com` | `password`
- Check database for other test users if needed
- Reset password if login fails: `./vendor/bin/sail artisan tinker --execute 'echo \App\Models\User::where("email", "test@example.com")->update(["password" => \Illuminate\Support\Facades\Hash::make("password")]);'`

## Portfolio Testing Insights
- Portfolio items require photographer profile completion first (returns 400 error if missing)
- Image uploads go to `storage/app/public/portfolios/` with unique filenames
- Portfolio items support: title (required), description (optional), category (optional), tags (JSON optional)
- Image files are automatically deleted when portfolio item is deleted
- Admin can view photographer portfolios via `/api/admin/users/{user}/portfolios`
- Admin can delete photographer portfolios via `/api/admin/users/{user}/portfolios/{portfolio}`
- Clients cannot access photographer portfolio endpoints (403 Forbidden)

## GitHub Workflow Guidelines

### Mission-ID Determination
- Mission-IDs are typically found in `.ai/` directory files (e.g., `.ai/mission-frontend.md`, `.ai/mission-backend.md`)
- Look for patterns like `MP-XXXX` or descriptive mission names in documentation
- When no explicit mission-ID is found, derive from task context (e.g., "login-profile-update" for login/profile tasks)
- Mission-IDs should be lowercase with hyphens: `feature-name`, `bugfix-issue`, `login-profile-update`

### Conventional Commit Format
- Use format: `feat(mission-ID): [brief description]`
- Examples:
  - `feat(login-profile-update): Enhance login flow and profile update`
  - `fix(auth-bug): Resolve authentication token expiration issue`
  - `docs(agents-md): Update AGENTS.md with GitHub workflow guidelines`
- Keep descriptions concise but descriptive (50-72 characters recommended)

### Branch Naming Conventions
- Feature branches: `feature/ai/[mission-ID]` (e.g., `feature/ai/login-profile-update`)
- Bug fix branches: `bugfix/[mission-ID]`
- Documentation branches: `docs/[mission-ID]`
- Hotfix branches: `hotfix/[mission-ID]`

### Complete GitHub Workflow Process
1. **Stage changes**: `git add .` or `git add -A`
2. **Commit with conventional format**: `git commit -m "feat(mission-ID): [description]"`
3. **Create feature branch**: `git checkout -b feature/ai/[mission-ID]`
4. **Push to GitHub**: `git push origin feature/ai/[mission-ID]`
5. **Create Pull Request**: Use GitHub CLI: `gh pr create --title "feat(mission-ID): [description]" --body "Detailed description of changes"`
6. **Merge PR**: `gh pr merge [PR-number] --merge --delete-branch`
7. **Sync local main**: `git checkout main && git pull origin main`

### GitHub MCP Server vs CLI Fallback
- **Preferred**: Use GitHub MCP server tools when authenticated
- **Fallback**: Use GitHub CLI (`gh`) when MCP server requires authentication
- **GitHub CLI Commands**:
  - `gh pr create --title "Title" --body "Description"`
  - `gh pr merge [number] --merge --delete-branch`
  - `gh pr view [number] --web` (to review in browser)

### Verification Checklist
- [ ] All changes staged and committed with proper mission-ID
- [ ] Feature branch created with correct naming convention
- [ ] Branch pushed to remote repository
- [ ] Pull request created with descriptive title and body
- [ ] PR reviewed and merged (if permissions allow)
- [ ] Local main branch synchronized with latest changes

## Quick Troubleshooting
1. **"sail: command not found"**: Ensure sail function is in ~/.zshenv and ~/.zshrc (see "Persistent Sail Alias Configuration" section)
2. **Frontend changes not visible**: Run `npm run build`
3. **API returns 500 error**: Check if services are running (`sail up -d`)
4. **Database issues**: Use MySQL MCP or `sail mysql`

=== comprehensive-testing-workflow ===

# Comprehensive Testing Workflow Guidelines

## End-to-End Validation Checklist
**Before declaring task completion, verify ALL of the following:**

### API Layer (Backend):
- [ ] Authentication works (login/logout)
- [ ] CRUD operations return correct status codes
- [ ] Data validation rules are enforced
- [ ] Database changes persist correctly

### Frontend Layer (UI):
- [ ] User can navigate through complete workflow via browser
- [ ] All form fields are present and functional
- [ ] Success/error messages display correctly
- [ ] No console errors (404, 405, 500, etc.)
- [ ] UI matches design expectations (compare with similar pages)

### Integration Layer:
- [ ] Frontend uses correct API endpoints
- [ ] Headers and authentication tokens are properly set
- [ ] Data flows correctly between frontend and backend
- [ ] Error handling works on both sides

## Error Handling Protocol
**When errors are encountered:**
1. **Log all errors** with context (API endpoint, response, UI state)
2. **Fix iteratively** - don't declare victory after fixing just one issue
3. **Re-test complete workflow** after each fix
4. **Verify error is truly resolved** (not just masked)

## Task Completion Criteria
**A task is ONLY complete when:**
- All explicit requirements in the task description are met
- No errors remain in console or API responses
- Frontend UI is complete and functional
- User can accomplish the goal through the browser interface
- Data integrity is verified in the database

## Common Pitfalls to Avoid
1. **Premature Completion**: Don't declare victory after API success alone
2. **Ignoring Console Errors**: 404/405 errors indicate unresolved issues
3. **Missing UI Elements**: Always compare with similar pages
4. **Assuming Design Intent**: Verify missing elements are intentional, not bugs

</laravel-boost-guidelines>
