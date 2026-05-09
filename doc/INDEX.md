# Documentation Index — Moussawer

> **Start here.** Quick map of every document in the project.

## First Read (session onboarding)
| # | Document | Purpose |
|---|----------|---------|
| 1 | `../CLAUDE.md` | Project overview, tech stack, quick start, warnings, scripts |
| 2 | `MISSION_HANDOFF.md` | Latest session: what happened, current state, gotchas, how to test |
| 3 | `BROWSER_TEST_PATTERNS.md` | Copy-paste Playwright snippets for testing all 3 roles |
| 4 | `../mission.log` | Chronological mission event log |

## Architecture & Reference
| Document | Purpose |
|----------|---------|
| `architecture-reference.md` | Full architecture: layers, patterns, data flow |
| `API.md` | API endpoint reference |
| `database-models.md` | Prisma models and relationships |
| `frontend-routes.md` | Frontend route map |
| `where-to-change.md` | Where to modify code for common tasks |
| `css-convention-index.md` | CSS class naming conventions |
| `../prisma/schema.prisma` | Database schema (20 models, 5 enums) |

## Setup & Environment
| Document | Purpose |
|----------|---------|
| `ENVIRONMENT_SETUP.md` | **Primary** — full local + production setup (Neon + Render) |
| `DATABASE_HOSTING.md` | Database connection troubleshooting |
| `FREE_HOSTING_GUIDE.md` | Free hosting overview (historical — see ENVIRONMENT_SETUP.md) |
| `LOCAL_SETUP_GUIDE.md` | Alternative local setup instructions |
| `../.env.example` | Environment variable template |

## Dev Tools & Scripts
| Document | Purpose |
|----------|---------|
| `dev-scripts.md` | Overview of all helper scripts |
| `dev-server-automation.md` | Server startup/shutdown automation |
| `playwright-mcp-setup.md` | Playwright MCP browser configuration |
| `playwright-mcp-testing.md` | Playwright testing patterns |

## Audit & Quality
| Document | Purpose |
|----------|---------|
| `../AUDIT_REPORT_FINAL.md` | Final audit report with prioritized roadmap |
| `performance-budget.md` | Performance targets and budgets |

## Historical (from previous sessions)
| Document | Purpose |
|----------|---------|
| `Mission.md` | Original project mission brief |
| `ai-reflection/` | Past session reflections (12 docs) |
| `ai-improvement-tasks/done/` | Completed improvement tasks |
| `adr/` | Architecture Decision Records |
| `audit/` | Previous audit findings |
| `incidents/` | Incident reports |
| `tasks/` | Task tracking from previous sessions |

## Quick Commands
```bash
npm run verify          # Typecheck + lint + tests
npm run check           # DB connectivity + seed check
npm run db:seed:verify  # Confirm seed data exists
npm run dev             # Start API (:4000) + Vite (:5173)
./scripts/smoke-test.sh # Test all API endpoints
```
