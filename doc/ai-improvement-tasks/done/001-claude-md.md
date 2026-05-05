# Problem
No CLAUDE.md or .clinerules file exists in the repository. AI agents start every mission with zero project-specific guidance, wasting time on basic discovery.

# Improvement Needed
Create a `CLAUDE.md` file at the repo root documenting: tech stack, how to run locally, service dependencies, known issues (Supabase free tier pausing, timezone-aware booking gotcha), key file locations, and the Route → Include → Resource architecture pattern.

# Expected Result
Future AI agents skip environment discovery and start working on the actual task immediately.
