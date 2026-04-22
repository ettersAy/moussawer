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

## Automatic Approach Selection

For browser automation tasks, automatically choose between MCP Playwright Server and Direct Playwright Installation based on these criteria:

### **Use MCP Playwright Server When:**
1. **Task is simple & exploratory** (1-3 actions, quick validation)
2. **Interactive debugging needed** (console logs, network inspection)
3. **Single action requests** (screenshot, page navigation, element check)
4. **Real-time feedback required** (immediate visual verification)
5. **No script reuse anticipated** (one-off tasks)

### **Use Direct Playwright Installation When:**
1. **Complex workflows** (4+ sequential actions)
2. **Data-driven tasks** (multiple test cases, parameterized inputs)
3. **Script reuse needed** (save to `/scripts/` directory)
4. **Integration with existing tests** (use `/e2e/` page objects)
5. **CI/CD or automation** (needs to run without MCP overhead)

## Decision Flowchart Implementation

When receiving a browser automation request:
1. **Analyze task complexity**: Count expected actions/steps
2. **Check for reuse indicators**: Words like "reusable", "script", "automate", "test"
3. **Look for integration needs**: References to existing tests, CI/CD, or data files
4. **Evaluate debugging requirements**: Console, network, or performance inspection
5. **Default to MCP** for ambiguous cases, with fallback to Direct if issues arise

## Execution Protocol

### For MCP Playwright Server:
- Use available MCP tools (`playwright_navigate`, `playwright_fill`, etc.)
- Handle version compatibility via updated wrapper configuration
- Clean up any temporary resources after task completion

### For Direct Playwright Installation:
- Create script in `/scripts/` directory with descriptive name
- Use ES module syntax (`import` not `require`)
- Leverage existing page objects from `/e2e/pages/` when possible
- Include error handling and logging
- Clean up script file unless explicitly asked to keep it

## Fallback Strategy

If chosen approach fails:
1. **MCP fails**: Switch to Direct Playwright with explanatory comment
2. **Direct Playwright fails**: Check browser installation and dependencies
3. **Both fail**: Report specific error and suggest manual verification

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

=== api-validation-patterns ===

# API Validation Patterns

## Client Profile Validation
### Required Fields & Formats:
- `phone`: E.164 format - `+15551234567` (no spaces/parentheses)
- `address`: string, max 255 chars
- `city`: string, max 100 chars  
- `province`: string, max 100 chars
- `postal_code`: Canadian format - `A1A1A1` or `A1A 1A1`
- `preferred_contact`: `email`, `phone`, or `sms`

### Example Valid Payload:
```json
{
  "phone": "+15551234567",
  "address": "123 Main Street",
  "city": "Toronto",
  "province": "ON",
  "postal_code": "M5H2N2",
  "preferred_contact": "email"
}
```

## Common Validation Failures
1. **Phone format** - Remove spaces/parentheses, use E.164
2. **Postal code** - Canadian format only
3. **Missing required fields** - All fields are required

## Authentication Flow
### Login Process:
- **Endpoint:** `POST /api/login`
- **Returns:** User data + Sanctum token
- **Token Usage:** `Authorization: Bearer {token}`

### Profile Endpoints:
- Client: `POST/GET/PUT/DELETE /api/client/profile`
- Photographer: `POST/GET/PUT /api/photographer/profile`

=== mcp-server-status ===

# MCP Server Status & Best Practices

## Available Servers (Based on Tool Analysis):
1. **czZ_-_0mcp0** (Playwright) - ✅ Working (requires headless mode)
2. **cI5hUp0mcp0** (Filesystem) - ✅ Working
3. **cSlD5l0mcp0** (MySQL) - ✅ WORKING (fixed - server running successfully)
4. **cTy-lz0mcp0** (GitHub) - ✅ Working
5. **cUCfDl0mcp0** (Docker) - ✅ Working

## Database Access Best Practices:
1. **Primary Method: Laravel Boost Database Tools**
   - Use `database-query` for read-only SQL queries
   - Use `database-schema` for table structure inspection
   - These tools integrate with Laravel's database configuration

2. **Secondary Method: Tinker for Eloquent Operations**
   - Use for simple Eloquent queries and model operations
   - Always use `echo` for output: `sail artisan tinker --execute 'echo User::count();'`
   - Use single quotes for shell, double quotes for PHP strings

3. **Tertiary Method: Sail MySQL Client**
   - Use for raw SQL queries: `sail mysql -u sail -ppassword -e "SELECT 1;"`
   - Useful for quick database inspections

4. **MySQL MCP Server Status**: 
   - ✅ WORKING (fixed - server running successfully)
   - Server ID: `cSlD5l0mcp0` (MySQL MCP server)
   - Connection: `127.0.0.1:3306` (sail/password, database: moussawer)
   - Tools available: `mysql_query`, `mysql_list_databases`

## General MCP Best Practices:
1. **Filesystem MCP**: Preferred over manual file operations
2. **Playwright MCP**: Use for HTTP requests and browser automation (always use headless mode)
3. **GitHub MCP**: Use for repository operations
4. **Docker MCP**: Use for container management

## Health Check Recommendations:
- Test MCP server availability before complex operations
- Have fallback strategies for critical servers
- Document server status in this file
- For database operations, default to Tinker or Laravel Boost tools

## MySQL MCP Server Installation & Benefits

### Installation Guide
For complete step-by-step installation instructions, see: `/srv/dev/moussawer/doc/MYSQL_MCP_REINSTALLATION_GUIDE.md`

**Quick Fix for JSON Errors**: If you see "Unexpected token 'D', 'Database c'... is not valid JSON" errors:
1. Ensure wrapper script has `ENABLE_LOGGING=false` and `MYSQL_LOG_LEVEL=error`
2. Redirect stderr to /dev/null: `exec npx -y @benborla29/mcp-server-mysql 2>/dev/null`
3. Test with: `echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {...}}' | /path/to/wrapper.sh`

### How MySQL MCP Helps AI Agents

#### Speed Benefits
1. **Direct SQL Execution**: Run queries without context switching to terminal
2. **Instant Schema Inspection**: Check table structures before writing migrations
3. **Data Validation**: Verify data exists before implementing features
4. **Performance Comparison**:
   - ⚡ **MySQL MCP**: Fastest for raw SQL
   - ⚡ **Laravel Boost**: Fast for Laravel-integrated queries  
   - 🐢 **Tinker**: Slow for Eloquent operations
   - ⚡ **Sail MySQL**: Fast for one-off commands

#### Common Use Cases for AI Agents
1. **Before writing migrations**: `SHOW CREATE TABLE users;`
2. **Debugging data issues**: `SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 5;`
3. **Verifying test data**: `SELECT COUNT(*) FROM users WHERE email LIKE '%@test.com';`
4. **Planning database changes**: `SHOW TABLES; SELECT table_name, table_rows FROM information_schema.tables;`

#### Integration Tips
- Use MySQL MCP for quick raw SQL queries and schema inspection
- Use Laravel Boost tools for Laravel-integrated queries when available
- Fall back to Tinker for complex Eloquent operations
- Use Sail MySQL for one-off commands in terminal

### Troubleshooting MySQL MCP
1. **JSON parsing errors**: Disable debug logging in wrapper script
2. "No connection found": Restart agent/IDE after configuration changes  
3. Connection timeout: Verify MySQL is running (`sail up -d`)
4. Permission denied: `chmod +x /path/to/wrapper.sh`

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
- `tests/Feature/` - Feature tests

## Authentication & Roles
- Three user roles: `admin`, `photographer`, `client`
- Sanctum token-based authentication
- Login endpoint: `POST /api/login`
- Token usage: `Authorization: Bearer {token}`

## Common API Endpoints
- Client profile: `GET/PUT/DELETE /api/client/profile`
- Photographer profile: `GET/PUT /api/photographer/profile`
- Bookings: `/api/client/bookings`, `/api/photographer/bookings`

## Test Accounts
- Client: `test@example.com` | `password`
- Check database for other test users if needed
- Reset password if login fails: `./vendor/bin/sail artisan tinker --execute 'echo \App\Models\User::where("email", "test@example.com")->update(["password" => \Illuminate\Support\Facades\Hash::make("password")]);'`

## Quick Troubleshooting
1. **"sail: command not found"**: Use `./vendor/bin/sail` instead
2. **Frontend changes not visible**: Run `npm run build`
3. **API returns 500 error**: Check if services are running (`./vendor/bin/sail up -d`)
4. **Database issues**: Use MySQL MCP or `./vendor/bin/sail mysql`

</laravel-boost-guidelines>
