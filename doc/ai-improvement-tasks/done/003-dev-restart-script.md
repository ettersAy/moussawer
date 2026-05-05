# Problem
Dev servers were killed and restarted 6+ times during this mission. Each restart required finding PIDs, killing by port, waiting, then running `npm run dev` in background. The first attempt used `pkill -f` which killed the shell itself.

# Improvement Needed
Create a `scripts/dev-restart.sh` script that safely kills processes on ports 4000 and 5173, waits for ports to free, then restarts `npm run dev` with output redirected to a timestamped log file.

# Expected Result
Single-command server restart with safe process killing and error output capture.
