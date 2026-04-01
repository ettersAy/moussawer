# AI Conventions

## Branch and commit style
- branches: `feature/ai/<area>/<desc>`, `bugfix/ai/<area>/<desc>`.
- commit: `feat(ai): ...`, `fix(ai): ...`, `test(ai): ...`.
- include mission id in PRs: `MP-1234`.

## Mission states
- `draft`, `in-progress`, `ready-for-review`, `done`.

## File templates
- `.ai/mission-backend.md`
- `.ai/mission-frontend.md`
- `.ai/context.md`
- `.ai/constraints.md`
- `.ai/incidents.md`

## Code guidelines
- Use resource objects for API responses.
- Services do business logic; controllers call service methods.
- Policies for authorization in controllers and route middleware.
- `app/Models/User` has role enum cast to `Enums\UserRole`.
