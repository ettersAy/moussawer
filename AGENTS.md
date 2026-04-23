<laravel-boost-guidelines>
# Laravel Boost Guidelines - Quick Reference

This file provides a quick reference to the comprehensive documentation organized in the `/doc/` directory.

## Documentation Structure

All detailed documentation has been moved to dedicated files in the `/doc/` directory:

| Documentation Area | File | Description |
|-------------------|------|-------------|
| **Tools & Development** | `doc/TOOLS.md` | MCP tools, Laravel Boost, Artisan, Tinker, browser automation, MySQL MCP troubleshooting |
| **Backend Development** | `doc/BACKEND.md` | PHP coding standards, Laravel Sail, Laravel best practices, Pint, authentication/roles, booking system, admin user management |
| **Frontend Development** | `doc/FRONTEND.md` & `doc/CSS_GUIDELINES.md` | Vue 3 structure, components, router, layouts, photographer discovery, strict Vue architecture rules |
| **Testing** | `doc/TESTING.md` | Test enforcement, PHPUnit rules, comprehensive testing workflow, portfolio testing |
| **Architecture** | `doc/ARCHITECTURE.md` | Project overview, stack, key directories, common commands |
| **API Documentation** | `doc/API.md` | API endpoints reference, authentication, role-based endpoints, documentation best practices |
| **Workflow** | `doc/WORKFLOW.md` | GitHub workflow, Mission-IDs, commit format, branch naming, definition of done |
| **Database** | `doc/DATABASE.md` | Database schema, migrations, relationships, performance seeding |

### Standalone Guides (Moved from Archive)
- `doc/MYSQL_MCP_REINSTALLATION_GUIDE.md` - Comprehensive MySQL MCP reinstallation guide
- `doc/performance_seeder_guide.md` - Performance optimization guide for database seeding

## Foundational Context

| Package | Version |
|---------|---------|
| php | 8.5 |
| laravel/framework | v13 |
| laravel/boost | v2 |
| laravel/pint | v1 |
| laravel/sail | v1 |
| phpunit/phpunit | v12 |
| vue | v3 |
| tailwindcss | v4 |

## Skills Activation

Activate the relevant skill **proactively** — don't wait until you're stuck.

- `laravel-best-practices` — Any Laravel PHP code: controllers, models, migrations, form requests, policies, jobs, Eloquent queries, caching, authorization, validation, queues, routes.
- `tailwindcss-development` — Any Tailwind utility classes in HTML/Vue templates; responsive layouts, flex/grid structures, UI components, dark mode, spacing/typography fixes. Skip for backend-only logic.

## Mandatory Protocol

For every task, proactively leverage configured MCP servers (Filesystem, Docker, MySQL, Playwright) to analyze project state, execute tests, and inspect database schemas **before** proposing code changes. Do not rely on assumptions — query tools to confirm file paths, schema structures, and test results.

## Mandatory Workflow Sequence

For ALL tasks, follow this exact sequence. Deviations will be rejected:

1. **Checkout main & pull latest**: `git checkout main && git pull origin main`
2. **Create feature branch**: `git checkout -b feature/ai/[mission-id]`
3. **Implement changes**: Write code following project conventions
4. **Write tests**: Add PHPUnit and/or E2E tests for new/modified functionality
5. **Run test suite**: `sail artisan test --compact` — iterate until all tests pass
6. **Format code**: `sail bin pint --dirty --format agent`
7. **Provide manual testing guide**: Include clear step-by-step instructions for the user to verify the implementation
8. **Commit & push**: Use proper commit format with Mission-ID
9. **Create PR**: Use GitHub MCP server or `gh` CLI

**Exception**: If the task is purely documentation (no code changes), steps 3-6 may be skipped.

## Quick Commands Reference

```bash
# Start services
sail up -d

# Run tests
sail artisan test --compact

# Format PHP code
sail bin pint --dirty --format agent

# Build frontend
npm run build

# Database access
sail mysql -u sail -ppassword
```

## Conventions

- Follow all existing code conventions. Check sibling files for structure, approach, and naming before writing new code.
- Use descriptive names: `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.
- Do not change application dependencies without approval.
- Stick to existing directory structure; don't create new base folders without approval.
- Be concise in explanations — focus on what matters, not obvious details.

## Frontend Bundling

If the user doesn't see a frontend change in the UI, they may need to run `sail npm run build`, `sail npm run dev`, or `sail composer run dev`. Ask them.

## MCP Server Status

| Server | Status | Notes |
|--------|--------|-------|
| Playwright | ✅ Working | Always use `headless: true` |
| Filesystem | ✅ Working | Preferred over manual file operations |
| MySQL | ✅ Working | 127.0.0.1:3306, user: sail, pass: password, db: moussawer |
| GitHub | ✅ Working | Prefer over `gh` CLI when authenticated |
| Docker | ✅ Working | Use for container management |

## Quick Troubleshooting

| Problem | Solution |
|---------|---------|
| `sail: command not found` | Add sail function to `~/.zshenv` and `~/.zshrc` |
| Frontend changes not visible | Run `npm run build` |
| API returns 500 | Check services: `sail up -d` |
| Database issues | Use MySQL MCP or `sail mysql -u sail -ppassword` |
| Tinker shows no output | Always use `echo` before the expression |
| Enum conversion error in Tinker | Use `->value` property |
| Playwright X display error | Ensure `headless: true` is set |
| ViteException manifest error | Run `npm run build` |

**For comprehensive documentation, refer to the dedicated files in `/doc/` directory.**

</laravel-boost-guidelines>
