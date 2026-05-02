# Problem
CSS is split across 17+ files in `src/styles/` with partially overlapping responsibilities (e.g., `admin.css` vs `tables.css` both contain table-related styles; `tags-badges.css` vs `buttons.css` both contain button-like element styles). There is no index or documented convention for where to place new styles.

# Improvement Needed
Create a CSS convention index documenting each file's purpose and boundaries. Add a note to `.clinerules` about which CSS file to extend for new admin panel components.

# Expected Result
Future agents will place new styles in the correct file on the first attempt, reducing style conflicts and duplicate declarations.
