# CSS Architecture Guidelines

## Overview
This project uses a modular, traditional CSS architecture. We avoid inline styles and minimize `<style scoped>` blocks in Vue components. Instead, we use a centralized, modular CSS system imported via `resources/css/app.css`.

**Constraint:** We are NOT using Tailwind CSS at this time. All styling is handled via standard CSS/SCSS modules.

## Directory Structure
```

resources/css/
├── app.css              # Main entry point. Imports all modules.
├── base/                # Resets, variables, typography
│   ├── reset.css
│   ├── variables.css    # :root { --primary-color: ... }
│   └── typography.css
├── components/          # Reusable UI patterns (NOT role-specific)
│   ├── buttons.css
│   ├── forms.css
│   ├── tables.css       # Shared table styles for Admin/Photographer/Client
│   ├── cards.css
│   ├── modals.css
│   └── badges.css
├── layouts/             # Structural layouts
│   ├── sidebar.css
│   ├── header.css
│   └── grid-system.css
├── roles/               # Role-specific layout overrides ONLY
│   ├── admin-layout.css
│   ├── photographer-layout.css
│   └── client-layout.css
├── views/               # Page-specific styles (Unique to one route)
│   ├── home.css
│   ├── photographer-services.css
│   └── admin-dashboard.css
└── utilities.css        # Helper classes (.mt-4, .text-center, .hidden)
```

## Key Principles

### 1. Separation of Concerns
- **Base:** Global resets and CSS variables.
- **Components:** Generic UI elements (Buttons, Inputs, Tables). These should be **role-agnostic**.
- **Roles:** Only use these for layout differences (e.g., Admin has a wider sidebar than Client). Do NOT put button styles here.
- **Views:** Styles that are unique to a single page and won't be reused.

### 2. The Import Flow
All CSS is bundled via `resources/js/app.js`:
```javascript
import '../css/app.css'
```

`app.css` acts as the manifest:
```css
/* 1. Base */
@import './base/reset.css';
@import './base/variables.css';
@import './base/typography.css';

/* 2. Utilities */
@import './utilities.css';

/* 3. Components (Shared) */
@import './components/buttons.css';
@import './components/forms.css';
@import './components/tables.css';
@import './components/modals.css';

/* 4. Layouts */
@import './layouts/sidebar.css';
@import './layouts/header.css';

/* 5. Roles (Layout Overrides) */
@import './roles/admin-layout.css';
@import './roles/photographer-layout.css';

/* 6. Views (Page Specific) */
@import './views/home.css';
@import './views/photographer-services.css';
```

### 3. Vue Component Guidelines
- **Default:** Use class names from the modular CSS system.
- **Scoped Styles:** ONLY use `<style scoped>` for:
  1. Dynamic styles based on component state (e.g., `v-bind(color)`).
  2. Highly complex animations specific to that component.
  3. Temporary styling during refactoring.
- **Rule of Thumb:** If the CSS is > 20 lines, it likely belongs in a `.css` file.

### 4. Naming Conventions (BEM Lite)
We use a simplified BEM approach to keep selectors flat and performant.
- **Block:** `.card`
- **Element:** `.card__header`
- **Modifier:** `.card--featured`
- **State:** `.is-active` (used with JS toggles)

**Example:**
```html
<div class="service-card service-card--featured">
  <div class="service-card__header">
    <h3 class="service-card__title">Wedding Photography</h3>
  </div>
</div>
```

### 5. Handling Role-Specific UI
If a "Button" looks different for Admin vs Client:
1. **Preferred:** Use a modifier class in HTML: `<button class="btn btn--admin">`.
2. **Avoid:** Creating `admin-buttons.css` and `client-buttons.css`. Duplication is bad.

### 6. Utilities
Since we don't have Tailwind, `utilities.css` is critical for layout speed.
```css
/* utilities.css */
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.text-center { text-align: center; }
.flex { display: flex; }
.hidden { display: none; }
```

### 7. Migration Strategy for Existing Files
1. Identify repeated patterns (e.g., all tables). Move to `components/tables.css`.
2. Identify page-specific layouts. Move to `views/[name].css`.
3. Remove `<style scoped>` from Vue files.
4. Update Vue templates to use the new class names.

## Benefits
- **Consistency:** A table looks the same in Admin and Photographer views.
- **Maintainability:** Change a button color in one place (`buttons.css`).
- **Performance:** Browser caches `app.css` globally.
- **Clarity:** Developers know exactly where to look for styles.
