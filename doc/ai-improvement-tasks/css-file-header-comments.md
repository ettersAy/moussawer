# Problem

The 17 CSS files in `src/styles/` have no header comments indicating their purpose or scope. Future agents must open each file to determine where a style belongs, or rely entirely on `doc/css-convention-index.md`. While the index exists now, header comments would provide immediate context when opening a file directly in the editor.

# Improvement Needed

Add a brief `/* Purpose: ... */` comment at the top of each CSS file in `src/styles/` summarizing:
- What component/page area this file styles
- What should NOT be added here (to prevent scope creep)
- The file's position in the import cascade (base → component → page → responsive)

# Expected Result

Future agents can determine a CSS file's purpose without switching context to the convention index. Decision time for placing a new style drops from ~15 seconds to ~2 seconds per file encountered.
