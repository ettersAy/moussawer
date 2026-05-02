# Problem
The `server/utils/http.ts` file contains several reusable utilities (`ok()` with meta support, `pagination()`, `AppError`, `validate()`, `asyncHandler`) that are undocumented. New agents waste time re-implementing pagination logic or discovering meta envelope support through trial and error.

# Improvement Needed
Document the available HTTP utilities, their signatures, and conventions for API response envelopes (including meta/pagination format) in `.clinerules` or a dedicated architecture doc.

# Expected Result
Future agents will discover and reuse existing utilities immediately instead of duplicating logic or guessing API response shapes.
