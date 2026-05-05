# Documentation Index — Moussawer

> **Start here.** Quick map of every document in the project.

## First Read (session onboarding)
| # | Document | Purpose |
|---|----------|---------|
| 1 | `../CLAUDE.md` | Project overview, tech stack, quick start, known issues |
| 2 | `MISSION_HANDOFF.md` | Latest session: what happened, current state, gotchas, how to test |
| 3 | `BROWSER_TEST_PATTERNS.md` | Copy-paste Playwright snippets for testing all 3 roles |

## Architecture & Reference
| Document | Purpose |
|----------|---------|
| `architecture-reference.md` | Full architecture: layers, patterns, data flow |
| `API.md` | API endpoint reference |
| `css-convention-index.md` | CSS class naming conventions across 18 stylesheets |
| `../prisma/schema.prisma` | Database schema (20 models, 5 enums) |

## Setup & Environment
| Document | Purpose |
|----------|---------|
| `ENVIRONMENT_SETUP.md` | Full local + production setup guide |
| `LOCAL_SETUP_GUIDE.md` | Alternative local setup instructions |
| `FREE_HOSTING_GUIDE.md` | Production hosting on Render + Supabase |
| `../.env.example` | Environment variable template |

## Dev Tools & Scripts
| Document | Purpose |
|----------|---------|
| `dev-scripts.md` | Overview of all helper scripts in `scripts/` |
| `dev-server-automation.md` | Server startup/shutdown automation |
| `playwright-mcp-setup.md` | Playwright MCP browser configuration |
| `playwright-mcp-testing.md` | Playwright testing patterns |

## Audit & Quality
| Document | Purpose |
|----------|---------|
| `../AUDIT_REPORT.md` | Round 1 audit: 33 issues across security, code quality, performance, frontend |
| `../AUDIT_REPORT_FINAL.md` | Final report: all fixes applied, prioritized roadmap, remaining debt |
| `performance-budget.md` | Performance targets and budgets |
| `documentation-audit.md` | Documentation quality audit |

## AI Reflection & Improvements
| Document | Purpose |
|----------|---------|
| `ai-reflection/mission-2026-05-05.md` | What went wrong in this mission, time wasters, learnings |
| `ai-improvement-tasks/done/` | 7 completed improvement tasks from this session |

## Mission History
| Document | Purpose |
|----------|---------|
| `Mission.md` | Original project mission brief |
| `new-chat-prompt-401-unauthorized.md` | Previous session: 401 handling investigation |
| `ai-reflection/*.md` | Previous session reflection notes |
| `adr/` | Architecture Decision Records |
| `audit/` | Previous audit findings |
| `incidents/` | Incident reports |
| `tasks/` | Task tracking from previous sessions |

## Quick Commands
```bash
./scripts/smoke-test.sh       # Test all 33 API endpoints
./scripts/db-check.sh          # Database connectivity + diagnostics
./scripts/dev-restart.sh       # Safe server restart
./scripts/playwright-check.sh  # Browser availability check
./scripts/schema-check.sh      # Schema integrity validation
```
