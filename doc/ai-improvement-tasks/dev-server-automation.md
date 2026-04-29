# Problem
Every Playwright validation session requires manually asking the user to start the Vite frontend and Express backend in separate terminals. This adds friction, delays testing, and interrupts the user's flow.

# Improvement Needed
Create a docker-compose.yml or PM2 config that starts both frontend and backend servers with a single command.

# Expected Result
AI agents can ask the user to run one command instead of two, reducing validation setup time from ~2 minutes to ~10 seconds.
