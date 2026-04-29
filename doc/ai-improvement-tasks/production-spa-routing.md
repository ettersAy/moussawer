# Problem

The production server (`server/index.ts`) serves the built frontend via `express.static("dist")` but lacks an SPA fallback route for client-side routing. Navigating directly to `/login`, `/dashboard`, `/admin`, etc. in production mode returns 404.

This was not documented anywhere. Future AI agents will encounter the same issue when testing the production build and waste time debugging what is a simple missing middleware.

# Improvement Needed

1. Document in `.clinerules` or `server/README.md` that the production server needs the SPA fallback (`app.get("*", ...)`) for client-side routing to work.
2. The fallback has been added to `server/app.ts` but should be verified present whenever server code is modified.

# Expected Result

Future AI agents should immediately know that production routing requires an SPA fallback, and how to verify it's in place, reducing debugging time.
