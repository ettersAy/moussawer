# API Specification

## Base layout
- `/api/v1/` (current)
- `/api/v2/` (future)

## Existing endpoints
- `GET /api/public/contact`
- `POST /api/public/contact` (contact form)
- Protected scoped endpoints under `/api/admin`, `/api/photographer`, `/api/client`

## Response format
- `success`, `status`, `data`, `message` for success.
- `success=false`, `status`, `error`, `message`, `errors` for failures.

## Naming conventions
- Use resource routes where possible (index, show, store, update, destroy).
- For custom actions, use verbs: `/api/photographer/{id}/earnings`.
