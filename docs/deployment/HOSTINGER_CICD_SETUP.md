# Hostinger CI/CD Deployment & Disaster Recovery Guide

This guide details the complete end-to-end setup for the automated deployment pipeline of **Jurnal-Mu** on Hostinger using GitHub Actions.

---

## 1. Architecture Overview

The deployment pipeline is configured in `.github/workflows/deploy.yml` and remote deployment is executed by `scripts/deploy.sh`.

```
[Developer Push to main]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  GitHub Actions: ci-tests                              │
│  - Setup PHP 8.4 & Node.js 22                          │
│  - Run `npm ci && npm run build` (Asset build check)   │
│  - Run `composer install`                              │
│  - Execute Pest Test Suite on SQLite in-memory/file    │
└────────────────────────────────────────────────────────┘
          │ (Pass)
          ▼
┌────────────────────────────────────────────────────────┐
│  GitHub Actions: deploy-hostinger                      │
│  - Authenticate via SSH (appleboy/ssh-action)          │
│  - Navigate to Hostinger application directory         │
│  - Execute `bash scripts/deploy.sh`                    │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  Hostinger Server: scripts/deploy.sh Execution         │
│  1. Automated MariaDB backup with integrity test       │
│  2. Sourcing Node.js / NVM (v20 / LTS)                 │
│  3. Git fetch & hard reset to origin/main              │
│  4. Composer install (production, optimized)           │
│  5. NPM install & production build                     │
│  6. Database migrations (`php artisan migrate --force`)│
│  7. Cache warmup & optimization                        │
│  8. Audit logging in storage/logs/deploy.log           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Step 1: Generate Dedicated SSH Key Pair

Create a dedicated Ed25519 key pair on your local machine.

```bash
ssh-keygen -t ed25519 -C "github-actions-jurnalmu-deploy" -f id_ed25519_hostinger -N ""
```

This generates two files:
- `id_ed25519_hostinger` (Private key — keep secure, will be added to GitHub Secrets).
- `id_ed25519_hostinger.pub` (Public key — will be added to Hostinger).

*(If your environment does not support Ed25519, use RSA 4096: `ssh-keygen -t rsa -b 4096 -C "github-actions-jurnalmu-deploy" -f id_rsa_hostinger -N ""`)*

---

## 3. Step 2: Configure Public Key in Hostinger hPanel

1. Log in to **Hostinger hPanel**.
2. Navigate to **Websites** -> Select your domain -> **Advanced** -> **SSH Access**.
3. Verify that **SSH Access** is toggled to **Enabled / Active**.
4. Take note of the connection parameters displayed:
   - **SSH IP / Host** (e.g., `195.35.x.x` or `ssh.journalmu.org`)
   - **SSH Port** (Hostinger default is `65002`)
   - **SSH Username** (e.g., `u123456789`)
5. In the **SSH Keys** section, click **Add SSH Key**:
   - **Key Name**: `github-actions-deploy`
   - **Public Key**: Copy and paste the entire contents of `id_ed25519_hostinger.pub`.
   - Click **Add**.

*Alternative via Terminal:*
If you already have SSH access, you can append the key directly to the authorized keys file:
```bash
cat id_ed25519_hostinger.pub | ssh -p 65002 u123456789@ssh.journalmu.org 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

---

## 4. Step 3: Configure GitHub Repository Secrets

Go to your repository on GitHub:
**Settings** -> **Secrets and variables** -> **Actions** -> Click **New repository secret**.

Add the following 5 repository secrets:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `HOSTINGER_SSH_HOST` | Hostinger SSH server IP address or hostname | `195.35.12.34` or `ssh.journalmu.org` |
| `HOSTINGER_SSH_PORT` | SSH port configured by Hostinger | `65002` |
| `HOSTINGER_SSH_USER` | SSH username | `u123456789` |
| `HOSTINGER_SSH_KEY` | Entire private key (`id_ed25519_hostinger`) including header and footer | `-----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----` |
| `HOSTINGER_APP_DIR` | Absolute or relative path to app directory from SSH home | `domains/journalmu.org/public_html` |

> **Note**: In `.github/workflows/deploy.yml`, fallback defaults are provided if `HOSTINGER_SSH_PORT` (defaults to `65002`) or `HOSTINGER_APP_DIR` (defaults to `domains/journalmu.org/public_html`) are not set, but setting them explicitly is recommended.

---

## 5. Step 4: Initial Server Preparation Checklist

Before the first automated CI/CD run, connect to your Hostinger server manually to ensure directory readiness.

### 5.1 Connect to Hostinger via SSH
```bash
ssh -p 65002 u123456789@ssh.journalmu.org
```

### 5.2 Navigate to Application Directory
```bash
cd domains/journalmu.org/public_html
```

### 5.3 Verify Git Remote
Ensure Git is initialized and tracking the correct remote repository:
```bash
git remote -v
# If needed, set the upstream origin:
# git remote set-url origin https://github.com/kyASse/jurnal_mu.git
```

### 5.4 Configure Production Environment (`.env`)
Verify that `.env` exists in the application root and contains valid production database credentials:
```env
APP_NAME=Jurnal-Mu
APP_ENV=production
APP_DEBUG=false
APP_URL=https://journalmu.org

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123456789_jurnalmu
DB_USERNAME=u123456789_dbuser
DB_PASSWORD="your-strong-production-db-password"
```

### 5.5 Set Directory Permissions & Create Backup Directory
`scripts/deploy.sh` writes database dumps to `storage/app/backups` and logs to `storage/logs`. Ensure they exist with appropriate write permissions:
```bash
mkdir -p storage/app/backups
mkdir -p storage/logs
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p bootstrap/cache

chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod -R 775 storage/app/backups
```

### 5.6 Ensure Node.js & NVM are Installed
Hostinger Cloud/VPS and cPanel environments often provide NVM. Confirm availability:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

node -v
npm -v
```
If NVM is not installed, install it via:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm alias default 20
```

### 5.7 Verify MariaDB / MySQL Dump Utility
Confirm `mariadb-dump` or `mysqldump` is available in PATH:
```bash
mariadb-dump --version 2>/dev/null || mysqldump --version
```
`scripts/deploy.sh` dynamically detects the available binary:
```bash
DUMP_BIN="$(command -v mariadb-dump || command -v mysqldump || echo 'mariadb-dump')"
```
> **Privilege Notice**: Shared hosting database users typically lack global `EVENT` and `PROCESS` privileges. `scripts/deploy.sh` executes backups with `--no-tablespaces` and omits `--events` to prevent privilege errors during automated backups:
> ```bash
> "$DUMP_BIN" -u "${DB_USER}" -p"${DB_PASS}" --single-transaction --routines --triggers --no-tablespaces "${DB_NAME}" | gzip > "${BACKUP_FILE}"
> ```

---

## 6. Step 5: Test Deployment via `workflow_dispatch`

You do not need to push a commit to trigger a test run. The workflow supports manual triggering:

1. Open your repository on GitHub.
2. Click the **Actions** tab.
3. In the left sidebar, select **CI/CD Deploy Hostinger**.
4. Click the **Run workflow** dropdown on the right.
5. Select branch `main` and click **Run workflow**.

### Verify Deployment Output
- Check the step execution logs in GitHub Actions for `Run CI Tests & Checks` and `Deploy to Hostinger via SSH`.
- SSH into Hostinger and inspect the generated logs:
  ```bash
  # Check deployment audit log
  cat storage/logs/deploy.log

  # Check backup log
  cat storage/logs/backup.log

  # Confirm latest backup file exists
  ls -lh storage/app/backups/
  ```

---

## 7. Troubleshooting Guide

### 7.1 `Permission denied (publickey)`
- **Symptom**: SSH step fails with `ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey]`.
- **Cause**: Mismatch between the private key in `HOSTINGER_SSH_KEY` and public key in Hostinger, or incorrect file permissions on `~/.ssh`.
- **Solution**:
  1. Confirm `HOSTINGER_SSH_KEY` in GitHub Secrets contains the full private key including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.
  2. Verify that `id_ed25519_hostinger.pub` is present in `~/.ssh/authorized_keys` on Hostinger.
  3. Ensure SSH directory permissions on Hostinger:
     ```bash
     chmod 700 ~/.ssh
     chmod 600 ~/.ssh/authorized_keys
     ```

### 7.2 `NVM not found` or `node: command not found`
- **Symptom**: Deployment log warns `NVM not found in $HOME/.nvm. Using system node if available.` followed by `npm: command not found`.
- **Cause**: Non-interactive SSH sessions do not load `.bashrc` or `.profile`, so NVM is not sourced automatically.
- **Solution**:
  - `scripts/deploy.sh` explicitly sources `$HOME/.nvm/nvm.sh`. Ensure NVM is installed directly under `$HOME/.nvm`.
  - Check path via SSH: `ls -la ~/.nvm/nvm.sh`. If installed in another directory, create a symlink:
    ```bash
    ln -s /path/to/nvm ~/.nvm
    ```

### 7.3 Out of Memory (OOM) During `npm run build` or `composer install`
- **Symptom**: Process killed with `Killed` or `fatal error: JavaScript heap out of memory`.
- **Cause**: Shared hosting plans enforce strict memory limits per process (e.g. 512MB to 1024MB).
- **Solution**:
  1. Limit Node.js memory allocation:
     ```bash
     export NODE_OPTIONS="--max-old-space-size=512"
     npm run build
     ```
  2. For Composer memory issues:
     ```bash
     COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
     ```

### 7.4 Database Credentials Not Found
- **Symptom**: `[-] ERROR: Database credentials (DB_NAME or DB_USER) not found in .env or environment!`
- **Cause**: `.env` file is missing in the application directory or does not contain `DB_DATABASE=` / `DB_USERNAME=`.
- **Solution**:
  - Ensure `.env` exists in `HOSTINGER_APP_DIR`.
  - Ensure lines match standard format: `DB_DATABASE=dbname` and `DB_USERNAME=dbuser`.

---

## 8. Disaster Recovery & Rollback Runbook

If a deployment introduces a critical bug or breaking schema change, follow this rollback procedure.

### 8.1 Step 1: Put Application in Maintenance Mode (Optional)
To prevent inconsistent state during recovery:
```bash
php artisan down --secret="emergency-bypass-token"
```

### 8.2 Step 2: Roll Back Application Code
Connect via SSH and roll back to the previously stable commit:
```bash
# View recent deployment commits
git log -n 5 --oneline

# Reset to stable commit SHA (replace with target commit)
git reset --hard <PREVIOUS_STABLE_COMMIT_SHA>

# Reinstall production dependencies and rebuild assets
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
npm run build
```

### 8.3 Step 3: Restore Database Backup
Every deployment run automatically creates a timestamped compressed backup in `storage/app/backups/backup_YYYYMMDD_HHMMSS.sql.gz`.

1. Find the backup created immediately prior to the failed deployment:
   ```bash
   ls -lt storage/app/backups/backup_*.sql.gz | head -n 5
   ```

2. Extract credentials from `.env`:
   ```bash
   DB_USER=$(grep -E '^DB_USERNAME=' .env | cut -d '=' -f2- | tr -d '\"\r\'')
   DB_PASS=$(grep -E '^DB_PASSWORD=' .env | cut -d '=' -f2- | tr -d '\"\r\'')
   DB_NAME=$(grep -E '^DB_DATABASE=' .env | cut -d '=' -f2- | tr -d '\"\r\'')
   ```

3. Restore database from compressed dump:
   ```bash
   # When DB_PASSWORD is set:
   gunzip -c storage/app/backups/backup_YYYYMMDD_HHMMSS.sql.gz | mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}"

   # If no password:
   gunzip -c storage/app/backups/backup_YYYYMMDD_HHMMSS.sql.gz | mysql -u "${DB_USER}" "${DB_NAME}"
   ```

### 8.4 Step 4: Clear & Rebuild Application Caches
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 8.5 Step 5: Bring Application Back Online
```bash
php artisan up
```

### 8.6 Step 6: Log Incident
Record details in `storage/logs/deploy.log`:
```bash
echo "$(date): Rollback performed to commit <PREVIOUS_STABLE_COMMIT_SHA> by $(whoami)" >> storage/logs/deploy.log
```
