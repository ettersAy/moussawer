# Problem
The booking availability system uses photographer-local timezone (e.g. America/Toronto) but accepts UTC timestamps in the API. Multiple booking attempts failed with `SLOT_UNAVAILABLE` before discovering that `09:00 UTC = 05:00 Toronto` which is outside the photographer's 9am-5pm availability window. This timezone gotcha is undocumented.

# Improvement Needed
Document the timezone conversion requirement in both the API validation error messages (hint at the expected local time) and in a developer guide. The API should return the photographer's timezone in the availability response and the error message should suggest checking timezone alignment.

# Expected Result
Developers and AI agents understand the timezone requirement on first contact instead of debugging through trial-and-error.
