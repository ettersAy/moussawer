# Reflection: Admin User Create/Edit Implementation (2026-05-02)

## Discovery Bottlenecks

- Input size limits on `editor` tool caused file creation to fail – had to split `UserFormModal.tsx` into 3 separate `edit_file` calls. Should use `write_file` for new files regardless of size.
- `Prisma.ClientProfileCreateInput` requires a `user` relation type but passing `userId` scalar works at runtime – TypeScript strict checking forced `as any` cast. Not obvious from Prisma types.
- Had to re-read auth.routes.ts to understand registration patterns (password hashing, profile creation) – a quick reference doc for common backend patterns would save time.

## Repeated Searches / Wasted Time

- Searched for `bcrypt` import location multiple times — not obvious that `auth.routes.ts` uses it but `admin.routes.ts` also needs it.
- Checked `schema.prisma` multiple times to verify `ClientProfile` and `PhotographerProfile` field names.
- Re-checked `userResource` return shape in `resources.ts` to ensure the existing `User` type in `api.ts` was compatible with the new form's data extraction.

## Missing Documentation / Rules

- No documented pattern for adding new admin API endpoints that create/update related models (e.g., creating User + profile in one request).
- The `uniqueSlug()` helper in `helpers.ts` was discovered by scanning imports – should be listed in `.clinerules` utilities section.
- No documentation about the Zod validation patterns used across route files – had to reverse-engineer from existing routes.

## Automation Opportunities

- Creating a new React component with form boilerplate could be semi-automated with a code generator.
- Repeated `Prisma` type assertion issues (`as any`) suggest a need for a documented pattern on how to handle scalar-only creates without relation types.
- The `editor` tool's 6000-char limit causes timeouts on medium files — a file-size checker before operation could prevent mid-edit failures.

## Hidden Conventions

- Admin route validation uses `z.nativeEnum()` for enums (Role, AccountStatus) — consistent pattern across all admin routes.
- The `bio` field is shared between ClientProfile and PhotographerProfile in the form but maps to different Prisma models depending on role.
- Modal components follow a consistent pattern: `open` prop, close on overlay click, `onClose`/`onConfirm` callbacks.
