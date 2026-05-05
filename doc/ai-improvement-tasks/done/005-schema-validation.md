# Problem
The DisputeComment model had a missing `@relation` on `authorId`, meaning no foreign key constraint and no way to include author data in queries. This was only discovered during deep schema audit. No automated schema validation exists beyond Prisma's built-in checks.

# Improvement Needed
Add a CI step or pre-commit hook that runs `prisma validate` and checks for: missing relation annotations on fields ending in `Id`, missing reverse relations, missing indexes on foreign key columns, and String fields that should use Json type.

# Expected Result
Schema integrity issues are caught before they reach production or waste AI agent debugging time.
