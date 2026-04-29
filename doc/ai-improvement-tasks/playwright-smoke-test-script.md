# Problem
AI agents manually run 6+ individual Playwright browser commands to validate route guards after every change. This is repetitive, error-prone, and time-consuming.

# Improvement Needed
Create a reusable Playwright smoke test script that automates the full validation checklist (homepage loads, unauthenticated redirect, role-based redirect, admin access, nav visibility).

# Expected Result
Validation becomes a single `browser_run_code` call instead of 6+ manual steps, reducing test time and eliminating forgotten checks.
