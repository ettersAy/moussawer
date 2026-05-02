# Self-Audit: EADDRINUSE Port 4000 Fix

**Date**: 2026-05-02  
**Task**: Fix `Error: listen EADDRINUSE: address already in use :::4000`  
**Repo**: `ettersAy/moussawer`  
**Branch**: `fix/eaddrinuse-port-4000`

---

## 🔍 Phase 1 — Diagnosis

| Step | Action | Tool(s) | Time/Cost | Notes |
|------|--------|---------|-----------|-------|
| 1 | Mapped project structure | `directory_tree` | 1 call | Identified Express API + Vite frontend architecture |
| 2 | Traced port config chain | `read_files` (4 files: `package.json`, `server/index.ts`, `server/config.ts`, `vite.config.ts`) | 1 call | `config.ts` reads `PORT` from `.env`, defaults to 4000 |
| 3 | Checked port occupancy | `lsof -i :4000` | 1 call | PID 253193 (`MainThrea`) occupying port 4000 |
| 4 | Read `.env` to confirm | `read_files` (`.env`) | 1 call | `PORT=4000` confirmed |

**Diagnosis**: Stale process from a previous `npm run dev` session still bound to port 4000.

### Friction Points
- Had to manually correlate 5 different files to trace the full port configuration chain
- `vite.config.ts` hardcoded `http://localhost:4000` — discovered incidentally, would silently break if someone changed `PORT` in `.env`
- Did not identify the stale process before killing it (`ps -p 253193 -o comm=`)

---

## 🔧 Phase 2 — Resolution

| Step | Action | File(s) | Outcome |
|------|--------|---------|---------|
| 1 | Killed stale process | `kill 253193` | Port 4000 freed |
| 2 | Added `EADDRINUSE` error handler | `server/index.ts` | Friendly error message instead of Node.js stack trace |
| 3 | Made Vite proxy dynamic | `vite.config.ts` | Proxy reads `PORT` from env via `loadEnv()` |
| 4 | Verified server starts | `npm run dev` | Both API (port 4000) and web (port 5173) start cleanly |

### What Changed

**`server/index.ts`** — Added error event handler:
```ts
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${config.port} is already in use.\n` +
      `   Run \`lsof -i :${config.port}\` to find the process, or change PORT in .env\n`
    );
    process.exit(1);
  }
  throw err;
});
```

**`vite.config.ts`** — Changed from static to env-driven proxy:
```ts
// Before: hardcoded
proxy: { "/api": "http://localhost:4000" }

// After: reads from env
const env = loadEnv(mode, process.cwd(), "");
const apiPort = env.PORT ?? "4000";
proxy: { "/api": `http://localhost:${apiPort}` }
```

---

## 📊 Efficiency Assessment

| Metric | Score | Notes |
|--------|-------|-------|
| **Total tool calls** | ~10 | Diagnosis in 3, resolution in 4, validation in 3 |
| **Time to diagnosis** | Fast | Root cause identified within 3 parallel reads |
| **Fixes applied** | 2 files | Both functional and preventative |
| **Side discoveries** | 1 | Hardcoded port in vite.config.ts — fixed proactively |
| **Regressions** | None | Both services start cleanly |

---

## 💡 Improvement Opportunities Identified

| # | Task | Priority | Category | Note ID |
|---|------|----------|----------|---------|
| 1 | **Port-audit utility script** (`scripts/port-audit.sh`) | Medium | Script | `7aa8daeb` |
| 2 | **Graceful shutdown hook** (SIGTERM/SIGINT in `server/index.ts`) | Low | Refactor | `3ec1ca86` |
| 3 | **SO_REUSEADDR** on Express server | Low | Refactor | `955b933d` |
| 4 | **Pre-start env-parity check** (extend `smoke-test.sh`) | Medium | Automation | `8b996579` |

---

## 🛠️ Reusable Workflows Gained

1. **Port conflict diagnosis pattern**: `lsof -i :PORT` → correlate with `.env` / config files → kill or reassign
2. **EADDRINUSE error handler template**: Reusable for any Express-based Node.js server
3. **Vite `loadEnv` pattern**: Decouples proxy targets from hardcoded values — applicable to any Vite project

---

## 📝 Lessons Learned

- **Pre-check before `kill`**: Always identify the process (`ps -p PID -o comm=`) before killing — could have been a production service
- **Config coupling**: Hardcoded ports across config files are a silent failure vector; env-driven configs with validation are safer
- **Error UX matters**: A 10-line error handler transforms a cryptic stack trace into an actionable message
- **Audit while you fix**: The self-audit process forced me to notice the vite.config.ts issue I would have otherwise missed
