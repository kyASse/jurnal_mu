#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo " Starting Jurnal-Mu Deployment: $(date)"
echo "=================================================="

# 1. Directory & Log Setup
APP_DIR="$(pwd)"
BACKUP_DIR="storage/app/backups"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"

mkdir -p "$BACKUP_DIR"
mkdir -p "storage/logs"

# 2. Extract Database Credentials from .env
if [ -f .env ]; then
  # Parse .env ignoring comments and empty lines
  DB_NAME="${DB_NAME:-$(grep -E '^DB_DATABASE=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"\r'\''')}"
  DB_USER="${DB_USER:-$(grep -E '^DB_USERNAME=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"\r'\''')}"
  DB_PASS="${DB_PASS:-$(grep -E '^DB_PASSWORD=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"\r'\''')}"
fi

if [ -z "${DB_NAME:-}" ] || [ -z "${DB_USER:-}" ]; then
  echo "[-] ERROR: Database credentials (DB_NAME or DB_USER) not found in .env or environment!" >&2
  exit 1
fi

# 3. Database Backup Flow
echo "[*] Creating database backup for ${DB_NAME}..."
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

DUMP_BIN="$(command -v mariadb-dump || command -v mysqldump || echo 'mariadb-dump')"

if [ -n "${DB_PASS:-}" ]; then
  "$DUMP_BIN" -u "${DB_USER}" -p"${DB_PASS}" \
    --single-transaction \
    --routines \
    --triggers \
    --no-tablespaces \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"
else
  "$DUMP_BIN" -u "${DB_USER}" \
    --single-transaction \
    --routines \
    --triggers \
    --no-tablespaces \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

# Verify backup integrity
echo "[*] Verifying backup integrity..."
gunzip -t "${BACKUP_FILE}"

BACKUP_SIZE="$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')"
echo "[+] Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
echo "$(date): Automated backup created: backup_${TIMESTAMP}.sql.gz (${BACKUP_SIZE}) by $(whoami)" >> storage/logs/backup.log

# 4. Load NVM & Node environment
echo "[*] Sourcing Node.js via NVM..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm use 20 || nvm use --lts || true
else
  echo "[!] Warning: NVM not found in $HOME/.nvm. Using system node if available."
fi

echo "Node version: $(node -v 2>/dev/null || echo 'not found')"
echo "NPM version: $(npm -v 2>/dev/null || echo 'not found')"

# 5. Git Pull
echo "[*] Pulling latest code from origin main..."
git fetch origin main
git reset --hard origin/main

# 6. PHP Dependencies
echo "[*] Installing Composer dependencies..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# 7. Frontend Build
echo "[*] Installing NPM dependencies & building assets..."
npm install --no-audit --no-fund
npm run build

# 8. Laravel Migrations & Storage Link
echo "[*] Running database migrations..."
php artisan migrate --force

echo "[*] Ensuring storage symlink..."
php artisan storage:link || true

# 9. Laravel Cache Warmup
echo "[*] Optimizing application caches..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 10. Audit Log & Completion
COMMIT_SHA="$(git rev-parse --short HEAD)"
echo "$(date): Deployed commit ${COMMIT_SHA} successfully by $(whoami)" >> storage/logs/deploy.log

echo "=================================================="
echo " Deployment Completed Successfully: commit ${COMMIT_SHA}"
echo "=================================================="
