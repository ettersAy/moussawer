# CSS Architecture

This document outlines the CSS architecture and organization for the Moussawer application.

## Overview

The CSS architecture follows a modular approach where styles are organized by component type and responsibility. This improves maintainability, reduces duplication, and makes it easier to scale the codebase.

## Directory Structure

```
resources/css/
├── app.css              # Main CSS entry point
├── README.md           # This file
├── components/         # Reusable component styles
│   ├── buttons.css    # Button component styles
│   ├── cards.css      # Card component styles (feature cards, testimonials)
│   └── sections.css   # Common section styles
└── views/             # View-specific styles
    └── home.css       # HomeView specific styles
```

## File Responsibilities

### `app.css`
- Main entry point for all CSS
- Imports Tailwind CSS
- Imports all CSS modules in the correct order
- Contains global theme configuration

### Component CSS Files (`components/`)
These files contain styles for reusable UI components that are used across multiple views:

1. **`buttons.css`** - Button styles including:
   - Base `.btn` class
   - Variants: `.btn-primary`, `.btn-outline`
   - Sizes: `.btn-large`
   - Button icon styles
   - Responsive button styles

2. **`cards.css`** - Card component styles including:
   - Feature cards (`.feature-card`)
   - Testimonial cards (`.testimonial`)
   - Card content structure
   - Hover effects and transitions

3. **`sections.css`** - Common section styles including:
   - Section headers (`.section-header`)
   - Section titles (`.section-title`)
   - Section subtitles (`.section-subtitle`)
   - Responsive section styles

### View CSS Files (`views/`)
These files contain styles specific to individual views:

1. **`home.css`** - HomeView specific styles including:
   - Hero section layout and styling
   - Features section layout
   - How It Works section
   - CTA section
   - Testimonials section
   - View-specific responsive styles

## Naming Conventions

- Use kebab-case for class names (e.g., `.feature-card`, `.hero-title`)
- Prefix view-specific classes with the view name when appropriate (e.g., `.home-container`)
- Use BEM-like naming for complex components when needed
- Avoid overly generic class names that could cause conflicts

## Best Practices

1. **Separation of Concerns**: Keep component styles in component files, view styles in view files
2. **Reusability**: Extract common patterns into component CSS files
3. **Specificity**: Use the minimum specificity needed
4. **Responsive Design**: Place responsive styles at the end of files, organized by breakpoint
5. **Comments**: Add comments for major sections and complex rules
6. **Consistency**: Follow existing patterns and conventions

## Adding New Styles

When adding new styles:

1. **For reusable components**: Add to the appropriate component CSS file
2. **For view-specific styles**: Add to the view's CSS file
3. **For truly global styles**: Consider if they belong in a new component file or `app.css`

## Build Process

CSS is processed through Vite and Tailwind CSS v4. The build process:
1. Processes `app.css` as the entry point
2. Imports all referenced CSS modules
3. Applies Tailwind CSS processing
4. Outputs optimized CSS to `public/build/assets/`

## Example: Extracting Styles from a Vue Component

When a Vue component's CSS grows large (>200 lines):
1. Identify reusable patterns that can be extracted
2. Move those patterns to appropriate component CSS files
3. Keep truly component-specific styles in the Vue file's `<style>` block
4. Update `app.css` to import new component files if needed

## Benefits of This Approach

1. **Reduced File Size**: HomeView.vue reduced from 701 lines to ~200 lines
2. **Improved Maintainability**: Related styles are grouped together
3. **Better Reusability**: Components can be styled consistently across views
4. **Easier Refactoring**: Changes to component styles affect all usages
5. **Clearer Structure**: Easy to understand where styles belong