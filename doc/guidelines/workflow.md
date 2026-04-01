# Workflow Guidelines

This doc mirrors the agent workflow and serves as the human-readable process for new tasks.

## Branch names
- `feature/ai/<domain>/<short>`
- `bugfix/ai/<domain>/<short>`

## Onboarding new feature
1. Add mission to `.ai/mission-backend.md` or `.ai/mission-frontend.md`.
2. Update `.ai/context.md` if needed.
3. Create service/controller/models + tests.
4. Run `vendor/bin/sail artisan test --compact --filter=MP-...`.

## Review
- PR title includes mission id and summary.
- Delegate 1 reviewer, 1 QA.
