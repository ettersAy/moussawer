#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Moussawer Backup Script
# Saves essential project files to /srv/dev/backup
# Excludes: node_modules, dist, .git, coverage, logs, caches, temp files
# ──────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="/srv/dev/backup"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_NAME="moussawer-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
ARCHIVE_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

echo "========================================"
echo " Moussawer Backup Script"
echo "========================================"
echo "Project  : ${PROJECT_DIR}"
echo "Backup   : ${BACKUP_PATH}"
echo "Archive  : ${ARCHIVE_PATH}"
echo ""

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Copy project files, excluding non-essential directories
echo "Copying project files (excluding node_modules, dist, .git, coverage, caches, logs)..."
rsync -a --progress \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='coverage' \
  --exclude='test-results' \
  --exclude='e2e/reports' \
  --exclude='*.log' \
  --exclude='*.db' \
  --exclude='.phpunit.cache' \
  --exclude='bootstrap/cache' \
  --exclude='storage/framework/cache' \
  --exclude='storage/framework/views' \
  --exclude='storage/framework/sessions' \
  --exclude='storage/logs' \
  --exclude='var/cache' \
  --exclude='var/log' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.venv' \
  --exclude='venv' \
  --exclude='.mcp/venv' \
  --exclude='.mcp/node_modules' \
  --exclude='.mcp/data' \
  --exclude='.mcp/tmp' \
  --exclude='.aider*' \
  --exclude='.expo' \
  --exclude='.gradle' \
  --exclude='android/.gradle' \
  --exclude='android/app/build' \
  --exclude='.next' \
  --exclude='.nuxt' \
  "${PROJECT_DIR}/" "${BACKUP_PATH}/"

# Create compressed archive
echo ""
echo "Creating compressed archive..."
cd "${BACKUP_DIR}"
tar -czf "${ARCHIVE_PATH}" "${BACKUP_NAME}"

# Show result
ARCHIVE_SIZE="$(du -sh "${ARCHIVE_PATH}" | cut -f1)"
echo ""
echo "========================================"
echo " Backup Complete!"
echo " Archive : ${ARCHIVE_PATH}"
echo " Size    : ${ARCHIVE_SIZE}"
echo "========================================"

# List what was backed up
echo ""
echo "Files backed up (top-level):"
ls -la "${BACKUP_PATH}/"
echo ""
echo "To restore, run:"
echo "  tar -xzf ${ARCHIVE_PATH} -C /path/to/restore"
