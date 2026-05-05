# Problem
AI agents repeatedly execute the same curl commands to test all 33 API endpoints. Each round of testing required manual token fetching, endpoint calling, and result checking. This consumed ~40% of mission time.

# Improvement Needed
Create a shell script `scripts/smoke-test.sh` that: fetches tokens for all 3 roles, tests every endpoint, validates responses, and reports pass/fail with a summary. Include timezone-correct booking test and pagination verification.

# Expected Result
Future AI agents run a single command to verify the entire API surface in under 30 seconds.
