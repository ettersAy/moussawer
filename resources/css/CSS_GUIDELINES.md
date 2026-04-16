# CSS Architecture Guidelines

## Overview
This project uses a modular CSS architecture with global styles, component-specific styles, and view-specific styles. All CSS is extracted from Vue Single File Components (SFCs) to maintain separation of concerns and improve maintainability.

## Directory Structure
```
resources/css/
├── app.css              # Global imports and base styles
├── components/          # Reusable component styles
│   ├── admin.css        # Admin layout and components
│   ├── auth.css         # Authentication forms (login, register)
│   ├── buttons.css      # Button styles
│   ├── cards.css        # Card components
│   ├── client.css       # Client layout and components
│   ├── forms.css        # Form elements and layouts
│   ├── layout.css       # Layout components (footer, containers)
│   ├── navigation.css   # Navigation components (navbar)
│   ├── photographer.css # Photographer layout and components
│   └── sections.css     # Section layouts (hero, features, etc.)
├── views/               # Page/view-specific styles
│   └── home.css         # Home page specific styles
└── CSS_GUIDELINES.md    # This file
```

## Key Principles

### 1. Separation of Concerns
- **Global styles** go in `app.css` (typography, colors, reset, utilities)
- **Component styles** go in `components/` (reusable UI elements)
- **View/page styles** go in `views/` (page-specific layouts)

### 2. CSS Import Flow
```javascript
// In resources/js/app.js
import '../css/app.css'
```

The `app.css` imports all other CSS files:
```css
/* app.css */
@import './components/buttons.css';
@import './components/cards.css';
@import './components/sections.css';
@import './components/forms.css';
@import './components/navigation.css';
@import './components/auth.css';
@import './components/layout.css';
@import './components/admin.css';
@import './components/client.css';
@import './components/photographer.css';
@import './views/home.css';
```

### 3. Vue Component Guidelines
- **DO NOT** put large CSS blocks in `<style scoped>` sections
- **DO** use extracted CSS classes from the modular system
- **DO** keep only truly component-specific scoped styles in Vue files
- **Example:**
```vue
<template>
  <div class="hero-section">
    <h1 class="hero-title">Welcome</h1>
    <button class="btn btn-primary">Get Started</button>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
/* Only keep styles that MUST be scoped to this component */
/* Example: dynamic styles based on component state */
</style>
```

### 4. Naming Conventions
- Use BEM-like naming: `.component-name__element--modifier`
- Be descriptive: `.hero-section` not `.section1`
- Follow existing patterns in the codebase

### 5. When to Extract CSS
Extract CSS from Vue files when:
- CSS exceeds 50 lines
- Styles are reusable across components
- Styles define layout/theme rather than component behavior

### 6. Adding New Pages/Views
1. Create view-specific CSS in `resources/css/views/[view-name].css`
2. Import it in `app.css`
3. Use the classes in your Vue component
4. Keep Vue file focused on template and logic

### 7. Responsive Design
- Use Tailwind-like breakpoints: `@media (min-width: 640px)`
- Keep responsive styles with their component/view
- Use mobile-first approach

### 8. CSS Organization Within Files
```css
/* 1. Base/Reset styles */
/* 2. Component styles */
/* 3. Layout styles */
/* 4. Utility classes */
/* 5. Responsive overrides */
```

## Migration Process for Existing Vue Files
1. Identify CSS blocks in `<style scoped>` section
2. Move to appropriate CSS module (component/view)
3. Update class names in template
4. Remove moved CSS from Vue file
5. Keep only truly scoped styles
6. Test thoroughly

## Benefits
- **Maintainability**: Easier to find and update styles
- **Reusability**: Components can share styles
- **Performance**: Better caching with separate CSS files
- **Scalability**: Scales well with large applications

## Example: HomeView.vue Migration
Original: 700+ lines with embedded CSS
After: ~100 lines with extracted CSS modules
Result: Cleaner separation, better organization