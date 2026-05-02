# CSS Convention Index

> **Purpose:** Document each CSS file's scope so new styles land in the correct file on the first attempt.
>
> All CSS files are imported by `src/styles/index.css` (loaded in `src/main.tsx`). The import order is: base utilities → component libraries → page-specific → responsive overrides.

---

## File Reference

### 1. `base.css` — Design Tokens & Global Reset

| Scope | Details |
|---|---|
| **CSS variables** | All `:root` custom properties: color palette (`--ink`, `--muted`, `--line`, `--paper`, `--wash`, `--charcoal`, `--blue`, `--green`, `--red`, `--amber`, each with `-soft` variants), `--shadow`, `font-family` |
| **Global resets** | `* { box-sizing }`, `body` margin/background, `a`, `button/input/select/textarea`, `img`, headings `h1`–`h3` |
| **Utility classes** | `.muted` |
| **Do NOT add here:** | Component-specific styles, page-specific layouts, responsive overrides |

### 2. `layout.css` — App Shell, Header, Hero, Page Layouts

| Scope | Details |
|---|---|
| **App shell** | `.app-shell` — full-page min-height wrapper |
| **Site header** | `.site-header`, `.brand`, `.brand-mark`, `.site-nav` — sticky top navigation bar |
| **Page wrapper** | `.page`, `.page.narrow` — centered content container |
| **Hero section** | `.hero`, `.hero-content`, `.hero img`, `.hero::after`, `.eyebrow`, `.hero .eyebrow` — full-viewport hero banner |
| **Search/Filter** | `.search-band`, `.filter-bar` — search and filter UI bars |
| **Section layouts** | `.section-grid`, `.section-heading` (sticky side), `.feature-grid`, `.split-heading`, `.compact-heading` |
| **Utilities** | `.clamp` (text truncation), `.empty-state`, `.stretch` |
| **Do NOT add here:** | Button styles, card styles, form controls, grid systems (see `grid.css`), admin-specific layouts |

### 3. `buttons.css` — Button Variants & Navigation Links

| Scope | Details |
|---|---|
| **Shared button base** | `.site-nav a`, `.ghost-button`, `.solid-button`, `.icon-button` — shared min-height, border-radius, transition |
| **Solid button** | `.solid-button` — charcoal filled primary action (`.danger` variant for red) |
| **Ghost button** | `.ghost-button` — bordered outline button |
| **Icon button** | `.icon-button` — 38×38 square icon-only button |
| **Modifiers** | `.compact` (shorter), `.full` (full width), `.danger` (red variant on solid) |
| **Action containers** | `.header-actions`, `.inline-actions` — flex row with 8px gap |
| **Do NOT add here:** | Tag/badge styles (see `tags-badges.css`), tab styles (see `tabs.css`), admin nav (see `admin.css`) |

### 4. `forms.css` — Form Controls & Validation States

| Scope | Details |
|---|---|
| **Labels** | `label` — grid layout with muted color and bold text |
| **Inputs** | `input`, `select`, `textarea` — shared border, focus ring (`--blue` + `--blue-soft`), sizing |
| **Segmented control** | `.segmented`, `.segmented button`, `.segmented .active` — two-option toggle |
| **Validation** | `.form-error`, `.form-success` — colored background messages |
| **Form layouts** | `.inline-form`, `.form-row` — grid-based label+input layouts |
| **Do NOT add here:** | Button styles (see `buttons.css`), card-like form containers (see `cards.css`) |

### 5. `cards.css` — Card Containers, Photographer Cards, Metrics

| Scope | Details |
|---|---|
| **Card base** | `.feature`, `.panel`, `.photographer-card`, `.metric`, `.auth-card` — shared border, radius, shadow |
| **Feature card** | `.feature` — icon + content block with padding |
| **Photographer card** | `.photographer-card`, `.card-image`, `.card-body` — profile card with aspect-ratio image |
| **Card internals** | `.card-title-row`, `.card-footer`, `.card-title-row h3`, `.card-title-row p` |
| **Inline elements** | `.rating` (amber), `.price` |
| **Do NOT add here:** | Grid layouts for cards (see `grid.css`), booking panel (see `booking.css`), modal cards (see `modals.css`) |

### 6. `grid.css` — Grid Layout Systems

| Scope | Details |
|---|---|
| **Card grid** | `.card-grid` — 3-column photographer grid |
| **Metrics grid** | `.metrics-grid`, `.metric` — 4-column stat cards (overrides card base) |
| **Dashboard/Case grids** | `.dashboard-grid`, `.case-grid` — 2-column page layouts |
| **Wide panel** | `.wide-panel` — full-width grid child |
| **Two-column** | `.two-column` — `1fr 380px` layout (e.g., profile page) |
| **Portfolio grid** | `.portfolio-grid` — 3-column portfolio image grid with figcaption overlay |
| **Do NOT add here:** | Single-column layouts, page-level wrappers (see `layout.css`), admin-specific grids (see `admin.css`) |

### 7. `tags-badges.css` — Tags, Status Badges, Verified Labels

| Scope | Details |
|---|---|
| **Tag row** | `.tag-row` — flex wrap row of tags |
| **Tag/Status** | `.tag`, `.status` — shared rounded pill style with bold text |
| **Tag** | `.tag` — muted background tag |
| **Verified overlay** | `.verified` — absolute-positioned dark overlay badge |
| **Do NOT add here:** | Button-like elements (see `buttons.css`), tone labels (see `tables.css`), admin count badges (see `admin.css`) |

### 8. `profile.css` — Photographer Profile Hero

| Scope | Details |
|---|---|
| **Profile hero** | `.profile-hero`, `.profile-hero img`, `.profile-hero::after` — full-width hero banner for photographer profiles |
| **Profile content** | `.profile-hero-content`, `.hero-meta`, `.hero-meta span` — text overlay and metadata chips |
| **Do NOT add here:** | Cards within profile page (see `cards.css`), booking panel (see `booking.css`), layout grids (see `grid.css`) |

### 9. `booking.css` — Booking Panel, Slots, Auth Forms, Case Forms

| Scope | Details |
|---|---|
| **Booking panel** | `.booking-panel` — sticky sidebar panel |
| **Time slots** | `.slot-grid`, `.slot`, `.slot.selected`, `.slot:disabled` — 3-column slot picker |
| **Mini note** | `.mini-note` — small muted text |
| **Auth pages** | `.auth-page`, `.auth-card`, `.auth-card.wide` — centered card for login/register |
| **Case forms** | `.case-form`, `.service-row`, `.day-rule-row` — support/incident/dispute forms |
| **Do NOT add here:** | General form inputs (see `forms.css`), buttons (see `buttons.css`), messages layout (see `messages.css`) |

### 10. `messages.css` — Messaging Layout & Chat Bubbles

| Scope | Details |
|---|---|
| **Messages layout** | `.messages-layout` — `320px 1fr` two-column grid |
| **Thread list** | `.thread-list`, `.thread`, `.thread.active` — conversation thread sidebar |
| **Message panel** | `.message-panel`, `.message-stream` — chat area with scrollable stream |
| **Bubbles** | `.bubble`, `.bubble.mine` — chat bubble (left-aligned / right-aligned) |
| **Message form** | `.message-form` — input + send button row |
| **Do NOT add here:** | Buttons (see `buttons.css`), form inputs (see `forms.css`), modals (see `modals.css`) |

### 11. `modals.css` — Modal Overlay & Confirm Dialogs

| Scope | Details |
|---|---|
| **Overlay** | `.modal-overlay` — fixed full-screen backdrop with blur |
| **Modal card** | `.modal-card` — centered card with shadow and heading/text/actions |
| **Modal icon** | `.modal-icon` — colored icon container |
| **Actions** | `.modal-actions` — right-aligned button row |
| **Animation** | `@keyframes fadeIn` — shared with admin sections |
| **Do NOT add here:** | Toast notifications (see `toasts.css`), inline dialogs |

### 12. `toasts.css` — Toast Notifications

| Scope | Details |
|---|---|
| **Toast container** | `.toast-container` — fixed bottom-right stack |
| **Toast** | `.toast` — grid layout with icon/message/close |
| **Variants** | `.toast-success`, `.toast-error`, `.toast-warning`, `.toast-info` — colored border/background |
| **Close button** | `.toast-close` — small transparent close button |
| **Animation** | `@keyframes toastIn` — slide-up entrance |
| **Do NOT add here:** | Modal dialogs (see `modals.css`), inline messages |

### 13. `admin.css` — Admin Panel Styles

| Scope | Details |
|---|---|
| **Admin tabs** | `.admin-tabs`, `.admin-tab`, `.admin-tab.active` — admin-specific tab navigation |
| **Admin section** | `.admin-section` — animated section wrapper (`fadeIn`) |
| **Admin page** | `.admin-page .metrics-grid` — 4-column admin metrics |
| **Portfolio manager** | `.portfolio-manager-grid`, `.portfolio-manager-card` — admin portfolio grid |
| **Users table** | `.users-toolbar`, `.search-wrapper`, `.search-input`, `.search-clear`, `.filter-select`, `.page-size-select` |
| **Bulk actions** | `.bulk-bar`, `.bulk-count` |
| **Loading/Empty** | `.loading-state`, `.empty-state` |
| **Users table structure** | `.users-table-wrapper`, `.users-table`, column classes (`.col-check`, `.col-avatar`, `.col-name`, `.col-joined`, `.col-actions`) |
| **User row** | `.user-row`, `.user-row.expanded`, `.user-avatar-thumb`, `.user-avatar-fallback`, `.user-actions`, `.role-select` |
| **Icons** | `.verified-icon`, `.unverified-icon`, `.verified-badge` |
| **Danger button** | `.danger` (shared override) |
| **Pagination** | `.pagination`, `.page-btn`, `.page-btn.active`, `.page-ellipsis`, `.page-info` |
| **User detail expand** | `.user-detail-row`, `.user-detail`, `.detail-header`, `.detail-grid`, `.detail-section`, `.detail-name`, `.detail-email`, `.detail-meta-row`, `.detail-role-tag`, `.detail-verified` |
| **Count badge** | `.count-badge` |
| **Do NOT add here:** | General tables (see `tables.css`), general tabs (see `tabs.css`), general buttons (see `buttons.css`) |

### 14. `tabs.css` — Section Tabs (General Purpose)

| Scope | Details |
|---|---|
| **Tab container** | `.section-tabs` — flex row with border/shadow |
| **Tab button** | `.section-tab`, `.section-tab.active` — tab pill with charcoal active state |
| **Do NOT add here:** | Admin-specific tabs (see `admin.css`), tab content sections |

### 15. `tables.css` — Table Rows, Table-Like List, Tones

| Scope | Details |
|---|---|
| **Table list** | `.table-list`, `.table-row`, `.soft-row` — grid-based row layout (for dashboards, services, etc.) |
| **Stacks** | `.content-stack`, `.list-stack` — stacked gap layout |
| **Support layout** | `.support-layout`, `.support-form` — support page grid |
| **Tone classes** | `.tone-warning` (amber), `.tone-good` (green), `.tone-danger` (red), `.tone-info` (blue), `.tone-neutral` — colored background/text |
| **Do NOT add here:** | Admin users table (see `admin.css`), card-like containers (see `cards.css`) |

### 16. `timeline.css` — Booking Timeline

| Scope | Details |
|---|---|
| **Timeline** | `.booking-timeline` — vertical timeline for booking status |
| **Timeline items** | `.booking-timeline-item`, `.booking-timeline-dot`, `.booking-timeline-dot.active` |
| **Do NOT add here:** | Any non-timeline booking styles (see `booking.css`) |

### 17. `responsive.css` — Responsive Breakpoints

| Scope | Details |
|---|---|
| **980px breakpoint** | Nav collapse, multi-column → 2-column, sticky → static |
| **680px breakpoint** | 2-column → 1-column, hero height, brand text hider, toast full-width, slot grid 2-col, portfolio manager 1-col, modal padding |
| **Do NOT add here:** | Non-responsive styles, admin-specific responsive overrides |

---

## Adding New Styles — Decision Flow

```
New style needed?
├─ Is it a CSS variable or global reset? → base.css
├─ Is it a layout/wrapper/page structure? → layout.css
├─ Is it a button? → buttons.css
├─ Is it a form control? → forms.css
├─ Is it a card/panel container? → cards.css
├─ Is it a grid system? → grid.css
├─ Is it a tag/badge/token? → tags-badges.css
├─ Is it for the photographer profile hero? → profile.css
├─ Is it for booking/auth forms/slots? → booking.css
├─ Is it for messaging/chat? → messages.css
├─ Is it a modal dialog? → modals.css
├─ Is it a toast notification? → toasts.css
├─ Is it an admin panel component? → admin.css  ← NEW ADMIN STYLES GO HERE
├─ Is it a general-purpose tab bar? → tabs.css
├─ Is it a row/list/table-like layout? → tables.css
├─ Is it a booking timeline? → timeline.css
├─ Is it a responsive breakpoint? → responsive.css
└─ Doesn't fit any? → evaluate if it should be a new file or merged into an existing one
```

## Import Order (in `index.css`)

The import order follows a cascade-friendly sequence:
1. **Base** — tokens, reset (`base.css`)
2. **Core components** — layout, buttons, forms, cards
3. **Utilities** — tags/badges, grids
4. **Features** — profile, booking, messages, modals, toasts
5. **Admin** — admin nav, tables, tabs, timelines
6. **Responsive** — media queries (`responsive.css`)

Always add new `@import` statements in `index.css` in the correct position.
