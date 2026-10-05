# Hostinger CI/CD Pipeline Design

## Overview
Automated CI/CD pipeline for `jurnal_mu` using GitHub Actions and Hostinger Shared Hosting via SSH.
Replaces manual deployment workflow while preserving automated database backup, safety gates, and cache management.

## Goals
- Eliminate manual SSH login for routine production deployments.
- Enforce automated testing (Pest & asset checks) prior to deploying to Hostinger.
- Automatically execute verified MariaDB database backup before codebase update.
- Provide manual fallback trigger via GitHub Actions UI (`workflow_dispatch`).
- Document explicit rollback procedures.

## Architecture

```mermaid
flowchart TD
    A[Push to main / workflow_dispatch] --> B[Job: CI Tests & Checks]
    B -->|Tests Pass| C[Job: Deploy to Hostinger via SSH]
    B -->|Tests Fail| D[Abort Pipeline - No Deployment]
    C --> E[Connect SSH via appleboy/ssh-action]
    E --> F[Execute scripts/deploy.sh on Hostinger]
    F --> G[Extract DB credentials from .env]
    G --> H[mariadb-dump & gzip verification]
    H -->|Backup Failed| I[Abort Script - Production Untouched]
    H -->|Backup Success| J[Source NVM & Node 20]
    J --> K[git pull origin main]
    K --> L[composer install --no-dev]
    L --> M[npm install && npm run build]
    M --> N[php artisan migrate --force]
    N --> O[php artisan storage:link & optimize caches]
    O --> P[Deployment Complete & Logged]
```

## System Components

### 1. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- **Triggers**:
  - `push` on branch `main`
  - `workflow_dispatch` (manual run button)
- **Job 1: `ci-tests`**:
  - Runner: `ubuntu-latest`
  - PHP: `8.4` with Composer v2
  - Node: `22`
  - Steps:
    - Code checkout
    - Dependency cache check
    - `npm ci && npm run build`
    - `composer install --no-interaction --prefer-dist --optimize-autoloader`
    - Testing database setup (`sqlite`)
    - Run Pest test suite: `./vendor/bin/pest`
- **Job 2: `deploy-hostinger`**:
  - Condition: `needs: [ci-tests]` (and strictly `github.ref == 'refs/heads/main'`)
  - Runner: `ubuntu-latest`
  - Uses: `appleboy/ssh-action@v1.2.1`
  - Environment variables & secrets passed:
    - `host`: `${{ secrets.HOSTINGER_SSH_HOST }}`
    - `username`: `${{ secrets.HOSTINGER_SSH_USER }}`
    - `key`: `${{ secrets.HOSTINGER_SSH_KEY }}`
    - `port`: `${{ secrets.HOSTINGER_SSH_PORT }}`
  - Command:
    ```bash
    cd "${{ secrets.HOSTINGER_APP_DIR || 'domains/journalmu.org/public_html' }}"
    bash scripts/deploy.sh
    ```

### 2. Deployment Script (`scripts/deploy.sh`)
- Executed on Hostinger shared hosting environment.
- Strict error handling: `set -euo pipefail`.
- Detailed pipeline steps:
  1. **Pre-flight & Directories**: Ensure `storage/app/backups` and `storage/logs` directories exist.
  2. **Database Credentials Extraction**:
     - Read `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` directly from `.env` using bash parsing.
     - Fallback to current environment variables if `.env` keys missing.
  3. **Database Backup**:
     - Timestamp format: `$(date +"%Y%m%d_%H%M%S")`
     - Command:
       ```bash
       mariadb-dump -u "$DB_USER" -p"$DB_PASS" \
         --single-transaction \
         --routines \
         --triggers \
         --events \
         "$DB_NAME" | gzip > "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
       ```
     - Verification: `gunzip -t "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"`
     - Log write: `echo "$(date): Automated backup created: backup_${TIMESTAMP}.sql.gz by $(whoami)" >> storage/logs/backup.log`
     - Fail-safe: If dump or test fails, script halts with non-zero exit code.
  4. **NVM Environment Sourcing**:
     - In non-interactive SSH shells, NVM is not auto-loaded. The script explicitly executes:
       ```bash
       export NVM_DIR="$HOME/.nvm"
       [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
       nvm use 20 || nvm use --lts
       ```
  5. **Code Pull & Dependencies**:
     - `git pull origin main`
     - `composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader`
     - `npm install`
     - `npm run build`
  6. **Artisan Commands & Cache Warmup**:
     - `php artisan migrate --force`
     - `php artisan storage:link`
     - `php artisan optimize:clear`
     - `php artisan config:cache`
     - `php artisan route:cache`
     - `php artisan view:cache`
     - `php artisan event:cache`
  7. **Deployment Log**:
     - Record success entry with timestamp and git commit SHA to `storage/logs/deploy.log`.

## Required GitHub Secrets

| Secret Name | Description | Example / Default |
|---|---|---|
| `HOSTINGER_SSH_HOST` | Hostinger server IP or domain | `156.67.xxx.xxx` / `journalmu.org` |
| `HOSTINGER_SSH_PORT` | SSH port configured on Hostinger | `65002` |
| `HOSTINGER_SSH_USER` | Hostinger SSH user | `u347029080` |
| `HOSTINGER_SSH_KEY` | Private SSH key (OpenSSH format) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `HOSTINGER_APP_DIR` | Absolute or relative domain web root | `domains/journalmu.org/public_html` |

## Error Handling & Failure Matrix

| Failure Stage | Impact | Resolution |
|---|---|---|
| Pest unit/feature test fails | GitHub Actions fails at `ci-tests`. No SSH connection initiated. | Fix broken test in branch/commit; push again. Production remains untouched. |
| Database dump failure | Script exits with status 1 before `git pull`. | Hostinger database was NOT modified; files NOT updated. Check Hostinger disk quota or DB credentials. |
| Composer / NPM build fails | Script exits immediately via `set -e`. | Investigate build error in GitHub Actions console. Re-run deployment or fix build dependencies. |
| Migration fails (`artisan migrate`) | Database partially migrated (or failed DDL). | Restore DB snapshot using backup file from `storage/app/backups/`. |

## Rollback Procedure

When an unrecoverable failure occurs in production:
1. **Restore Database**:
   ```bash
   gunzip -c storage/app/backups/backup_<TIMESTAMP>.sql.gz | mariadb -u $DB_USER -p$DB_PASS $DB_NAME
   ```
2. **Revert Git Repository**:
   ```bash
   git checkout <LAST_KNOWN_STABLE_COMMIT>
   ```
3. **Rebuild Dependencies & Cache**:
   ```bash
   composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
   npm run build
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
