# Hostinger CI/CD Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build automated CI/CD pipeline deploying `jurnal_mu` to Hostinger shared hosting with automated database backup and zero routine manual SSH steps.

**Architecture:** GitHub Actions workflow triggers on `main` push and manual dispatch, runs Pest test suite in CI runner, then connects to Hostinger via `appleboy/ssh-action` to run `scripts/deploy.sh` which executes backup, NVM setup, pull, dependencies, build, and Laravel cache warmup.

**Tech Stack:** GitHub Actions, Bash, MariaDB Dump, SSH (`appleboy/ssh-action`), Laravel 12 / PHP 8.4, Node.js 20 / Vite.

**Spec:** [docs/superpowers/specs/2026-10-05-hostinger-cicd-pipeline-design.md](file:///c:/xampp/htdocs/jurnal_mu/docs/superpowers/specs/2026-10-05-hostinger-cicd-pipeline-design.md)

## Global Constraints
- Target hosting: Hostinger Shared Hosting (Linux SSH).
- App directory: `domains/journalmu.org/public_html`.
- PHP runtime on server: PHP 8.3/8.4 CLI.
- Node runtime on server: Node 20 via NVM.
- No secrets or credentials hardcoded in git.
- If database backup fails, abort entire deployment immediately (`set -euo pipefail`).

---

### Task 1: Create Hostinger Deployment Script (`scripts/deploy.sh`)

**Files:**
- Create: `scripts/deploy.sh`

**Interfaces:**
- Consumes: Hostinger environment variables or `.env` file (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), local git clone on server.
- Produces: Executable deployment script with database backup, code sync, build, and cache warmup.

- [ ] **Step 1: Write `scripts/deploy.sh`**

```bash
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
  DB_NAME="${DB_NAME:-$(grep -E '^DB_DATABASE=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"'\''')}"
  DB_USER="${DB_USER:-$(grep -E '^DB_USERNAME=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"'\''')}"
  DB_PASS="${DB_PASS:-$(grep -E '^DB_PASSWORD=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\"'\''')}"
fi

if [ -z "${DB_NAME:-}" ] || [ -z "${DB_USER:-}" ]; then
  echo "[-] ERROR: Database credentials (DB_NAME or DB_USER) not found in .env or environment!" >&2
  exit 1
fi

# 3. Database Backup Flow
echo "[*] Creating database backup for ${DB_NAME}..."
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

if [ -n "${DB_PASS:-}" ]; then
  mariadb-dump -u "${DB_USER}" -p"${DB_PASS}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"
else
  mariadb-dump -u "${DB_USER}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
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
  \. "$NVM_DIR/nvm.sh"
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
npm install
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
```

- [ ] **Step 2: Set execution permissions & validate bash syntax**

Run:
```bash
git update-index --chmod=+x scripts/deploy.sh
bash -n scripts/deploy.sh
```
Expected: Exit code 0, no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/deploy.sh
git commit -m "feat(ci): add Hostinger deployment script with automated DB backup"
```

---

### Task 2: Create GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: GitHub Secrets (`HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY`, `HOSTINGER_APP_DIR`).
- Produces: Automated test & deployment pipeline triggered on push to `main` and `workflow_dispatch`.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: CI/CD Deploy Hostinger

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  ci-tests:
    name: Run CI Tests & Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          tools: composer:v2
          coverage: none

      - name: Cache Composer packages
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: |
            ${{ runner.os }}-composer-

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Node Dependencies
        run: npm ci

      - name: Build Frontend Assets Check
        run: npm run build

      - name: Install PHP Dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader

      - name: Prepare Environment File
        run: cp .env.example .env

      - name: Generate App Key
        run: php artisan key:generate

      - name: Setup SQLite Database for Tests
        run: |
          mkdir -p database
          touch database/database.sqlite
          sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
          sed -i 's/DB_DATABASE=jurnal_mu/DB_DATABASE=database\/database.sqlite/' .env
          php artisan migrate:fresh --seed --force

      - name: Run Pest Tests
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: database/database.sqlite
        run: ./vendor/bin/pest

  deploy-hostinger:
    name: Deploy to Hostinger via SSH
    needs: [ci-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Trigger Remote Deployment
        uses: appleboy/ssh-action@v1.2.1
        with:
          host: ${{ secrets.HOSTINGER_SSH_HOST }}
          username: ${{ secrets.HOSTINGER_SSH_USER }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          port: ${{ secrets.HOSTINGER_SSH_PORT || 65002 }}
          script_stop: true
          command_timeout: 15m
          script: |
            TARGET_DIR="${{ secrets.HOSTINGER_APP_DIR || 'domains/journalmu.org/public_html' }}"
            echo "[*] Navigating to ${TARGET_DIR}..."
            cd "${TARGET_DIR}"
            
            if [ ! -f "scripts/deploy.sh" ]; then
              echo "[*] Initializing or pulling deploy script from git..."
              git fetch origin main
              git checkout origin/main -- scripts/deploy.sh
              chmod +x scripts/deploy.sh
            fi
            
            chmod +x scripts/deploy.sh
            bash scripts/deploy.sh
```

- [ ] **Step 2: Validate YAML syntax**

Run:
```powershell
python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml', 'r'))"
```
Expected: Exit code 0, YAML successfully parsed without syntax error.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(deploy): add Hostinger automated deployment workflow"
```

---

### Task 3: Create Hostinger & GitHub Actions Setup Guide (`docs/deployment/HOSTINGER_CICD_SETUP.md`)

**Files:**
- Create: `docs/deployment/HOSTINGER_CICD_SETUP.md`

**Interfaces:**
- Consumes: Workflow and script specifications.
- Produces: Complete human-readable guide for setting up SSH keys, Hostinger permissions, GitHub repository secrets, testing the first pipeline run, and disaster recovery.

- [ ] **Step 1: Write `docs/deployment/HOSTINGER_CICD_SETUP.md`**

Content must cover:
1. SSH Key pair generation command.
2. Adding public key in Hostinger hPanel.
3. Adding 5 repository secrets in GitHub (`HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY`, `HOSTINGER_APP_DIR`).
4. Initial Hostinger preparation checklist (git remote verification, folder write permissions for `storage/app/backups`).
5. How to test deployment using `workflow_dispatch`.
6. Troubleshooting guide (permission denied, NVM not found, memory limit).
7. Rollback runbook commands.

- [ ] **Step 2: Verify file existence & markdown structure**

Run:
```powershell
Test-Path docs/deployment/HOSTINGER_CICD_SETUP.md
```
Expected: `True`.

- [ ] **Step 3: Commit**

```bash
git add docs/deployment/HOSTINGER_CICD_SETUP.md
git commit -m "docs: add Hostinger CI/CD setup and disaster recovery guide"
```

---

### Task 4: Verify Full Pipeline Setup

**Files:**
- Test all created artifacts and git log.

- [ ] **Step 1: Verify git status and tracked files**

Run:
```bash
git status --short
```
Expected: Clean working tree.

- [ ] **Step 2: Verify script lint and workflow schema**

Run:
```powershell
bash -n scripts/deploy.sh
python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml', 'r'))"
```
Expected: Both return exit code 0.
