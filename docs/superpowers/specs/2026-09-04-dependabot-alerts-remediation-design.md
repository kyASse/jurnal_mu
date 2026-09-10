# Dependabot Alerts Remediation & CI Quality Design

- **Date**: 2026-09-04
- **Repository**: [kyASse/jurnal_mu](https://github.com/kyASse/jurnal_mu)
- **Target Branch**: `development` (Strict constraint: PRs merged to `development`, not `main`)

---

## 1. Overview & Problem Statement

GitHub Dependabot audit on repository `kyASse/jurnal_mu` detected:
- **132 Open Security Alerts**:
  - **3 Critical**: `vitest` (#101), `tar` (#159), `shell-quote` (#102)
  - **49 High**: `laravel/framework` (#117), `vite` (#55, #56, #108), `axios` (#91-#96, #132, #139), `fast-uri`, `brace-expansion`, `symfony/http-kernel` (#79), `symfony/mime` (#81), `league/commonmark`, `guzzlehttp/guzzle`, `nanoid`, `postcss`, `undici`, `minimatch`
  - **68 Medium**: `laravel/framework` (#116), `hono`, `guzzlehttp/psr7`, `symfony/routing`, `symfony/mailer`, `ip-address`
  - **12 Low**: `symfony/yaml`, `symfony/polyfill-intl-idn`, `qs`, `@babel/core`, `postcss-selector-parser`
  - Split: 95 npm alerts, 37 composer alerts.
- **13 Open Dependabot PRs**:
  - All PRs currently target `main` branch instead of `development`.
  - CI test workflow (`tests.yml`) fails on PRs because [phpunit.xml](file:///c:/xampp/htdocs/jurnal_mu/phpunit.xml) hardcodes `DB_CONNECTION=mysql` and `DB_DATABASE=jurnal_mu_testing` while runner has no MySQL service container.
- **Missing Dependabot Configuration**:
  - No `.github/dependabot.yml` exists, causing unbundled individual PRs targeting the default repository branch (`main`).

---

## 2. Remediation Strategy (Hybrid Approach)

The solution is divided into three distinct execution phases:

```
[Phase 1: Foundation]
  ├── Fix tests.yml / phpunit.xml (SQLite in-memory for CI test suite)
  └── Add .github/dependabot.yml (target: development, grouped updates)
            │
            ▼
[Phase 2: PR Retarget & Merge]
  ├── Retarget 13 open PRs from main -> development
  ├── Wait for PR Quality Checks & CI Tests to pass
  └── Squash & merge PRs in dependency order into development
            │
            ▼
[Phase 3: Residual Vulnerabilities Resolution]
  ├── Pull latest development branch locally
  ├── Branch: security/resolve-dependency-alerts
  ├── composer update (direct & indirect security updates)
  ├── npm audit fix + explicit bumps for criticals (vitest, tar, shell-quote, axios)
  ├── Verify: npm audit, composer audit, ./vendor/bin/pest, npm run types
  └── Create PR -> development, verify alerts drop on GitHub
```

---

## 3. Phase 1: CI Testing & Dependabot Configuration

### 3.1 Fix CI Pest Execution in `.github/workflows/tests.yml`
- In [.github/workflows/tests.yml](file:///c:/xampp/htdocs/jurnal_mu/.github/workflows/tests.yml#L65-L70), the job tries to rewrite `.env` to SQLite, but [phpunit.xml](file:///c:/xampp/htdocs/jurnal_mu/phpunit.xml#L25-L27) overrides `.env` with:
  ```xml
  <env name="DB_CONNECTION" value="mysql"/>
  <env name="DB_PORT" value="3306"/>
  <env name="DB_DATABASE" value="jurnal_mu_testing"/>
  ```
- **Fix**: Update `.github/workflows/tests.yml` step to run Pest with explicit environment overrides:
  ```yaml
  - name: Run Tests (Pest)
    env:
      DB_CONNECTION: sqlite
      DB_DATABASE: database/database.sqlite
    run: ./vendor/bin/pest
  ```
  Ensure database directory and sqlite file exist prior to running migrations and tests.

### 3.2 Add `.github/dependabot.yml`
- Create `.github/dependabot.yml`:
  - Enforce `target-branch: "development"`.
  - Group composer updates into `composer-dependencies`.
  - Group npm updates into `npm-dependencies`.
  - Schedule: `weekly`.
  - Set `open-pull-requests-limit: 10`.

---

## 4. Phase 2: Retarget & Merge Existing 13 PRs

### 4.1 PR Retargeting List
Retarget each open PR from `main` to `development` using:
`gh pr edit <PR_NUMBER> --base development`

Open PRs to retarget:
1. **Composer PRs**:
   - #264: `league/commonmark` (2.8.2 → 2.10.0)
   - #246: `guzzlehttp/guzzle` (7.10.0 → 7.15.2)
2. **NPM PRs**:
   - #267: `fast-uri` (3.1.0 → 3.1.7)
   - #266: `@humanfs/node` (0.16.6 → 0.16.8)
   - #265: `postcss-selector-parser` (7.1.1 → 7.1.5)
   - #260: `brace-expansion`
   - #253: `@hono/node-server` (1.19.14 → 1.19.17)
   - #252: `nanoid` (3.3.11 → 3.3.18)
   - #251: `js-yaml` (4.1.1 → 4.3.1)
   - #250: `hono` (4.12.14 → 4.13.1)
   - #247: `ip-address` and `express-rate-limit`
   - #245: `undici` (7.22.0 → 7.29.0)
   - #244: `postcss` (8.5.12 → 8.5.25)

### 4.2 Merge Order & Conflict Prevention
1. Merge Composer PRs first: #264, #246.
2. Merge NPM PRs progressively.
3. If lockfile conflicts arise after merging previous PRs, trigger `@dependabot rebase` on subsequent PRs or resolve lockfile on local `development`.

---

## 5. Phase 3: Consolidated Residual Alert Fixes

### 5.1 Local Workspace Execution
1. Checkout and pull latest `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b security/resolve-dependency-alerts
   ```
2. PHP / Composer Resolution:
   - Run `composer update laravel/framework symfony/* guzzlehttp/* league/commonmark --with-all-dependencies`
   - Verify with `composer audit` to confirm zero vulnerabilities in PHP dependencies.
3. NPM Resolution:
   - Run `npm audit fix`
   - Explicitly update critical packages:
     - `vitest`: update to `>= 4.1.0`
     - `tar`: update to `>= 7.5.19`
     - `shell-quote`: update to `>= 1.8.4`
     - `axios`: ensure updated to `>= 1.18.0`
   - Verify with `npm audit` to ensure critical and high vulnerabilities are resolved.

### 5.2 Local Quality Verification
- Code style: `vendor/bin/pint --test`
- TypeScript checking: `npm run types`
- Formatting: `npm run format:check`
- Frontend build: `npm run build`
- Pest unit tests: `./vendor/bin/pest` (or via docker container `docker exec -it jurnal-mu-app ...`)

### 5.3 PR & Remote Verification
- Commit changes and push `security/resolve-dependency-alerts` to `origin`.
- Create PR targeting `development`:
  `gh pr create --base development --title "fix(security): resolve residual dependabot alerts" --body "..."`
- Verify CI passes, merge into `development`.
- Query GitHub API `repos/kyASse/jurnal_mu/dependabot/alerts?state=open` to confirm resolution.
