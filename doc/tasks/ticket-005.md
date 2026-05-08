# Ticket 005: Portfolio Image Upload UX

**Status:** todo  
**Priority:** P2  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  

---

## Description

Improve the portfolio item creation/edit form by replacing the bare URL text input with a better image UX. Currently photographers must paste raw image URLs into a text field (placeholder: "https://...") — no preview, no upload, no validation beyond the URL format check in the API.

Since this project has no cloud storage integration yet, the pragmatic improvement is: add live image preview, better URL validation feedback, and a polished UX that makes the URL-based workflow feel intentional rather than unfinished.

---

## What to Build

In `PhotographerDashboard.tsx`, in the `PortfolioManager` component:

1. **Live Image Preview** — When a URL is entered, show a thumbnail preview of the image below the input. If the URL is invalid or the image fails to load, show a placeholder/error state.
2. **Paste/Drop Zone** — Add a visual drop zone or at minimum improve the input styling to feel like an image field (camera icon, better placeholder text)
3. **Image load error handling** — If the URL doesn't resolve to an image, show "Unable to load image preview" instead of a broken `<img>` tag

### Implementation
- Add an `<img>` preview element that updates on URL input blur/change
- Use `onError` on the `<img>` to catch broken image URLs
- Style the image input area to feel intentional (not just a bare text field)

### Out of scope (future tickets)
- Actual file upload to cloud storage (requires S3/Supabase Storage integration)
- Drag-and-drop from desktop
- Multi-image upload

---

## Files to Modify
- `src/pages/photographer/PhotographerDashboard.tsx` — `PortfolioManager` component (form around line 295-318, card display around line 321-343)

---

## Acceptance Criteria
| AC | Description |
|----|-------------|
| AC1 | Image URL input shows a live preview thumbnail after entering a valid URL |
| AC2 | Invalid/broken image URLs show a graceful fallback (not a broken img tag) |
| AC3 | Portfolio cards in the grid already have images — ensure they handle load errors too |
| AC4 | Form layout remains clean and matches existing design patterns |
| AC5 | `npm run build` and `npm run lint` pass | ✅ |

---

## Implementation Notes

### What Was Done

1. **Live image preview** — When a URL is entered in the portfolio form, a thumbnail preview appears below the input (max 300x200px, rounded, object-fit cover)

2. **Error handling** — `onError` on the preview `<img>` shows "Unable to load image preview" with an ImageOff icon instead of a broken image

3. **Portfolio card images** — Extracted `ItemImage` component that handles load errors gracefully, showing "No preview" fallback instead of broken `<img>` tags

4. **State management** — `previewFailed` state resets when URL changes or form resets

### Files Changed
- `src/pages/photographer/PhotographerDashboard.tsx` — `PortfolioManager` form preview + `ItemImage` component
