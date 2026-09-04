# Dependabot Alerts Remediation & CI Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate 132 Dependabot security alerts on `kyASse/jurnal_mu`, fix CI Pest database failures, configure `.github/dependabot.yml` targeting `development`, retarget & merge 13 open PRs to `development`, and resolve residual transitive alerts via a consolidated PR.

**Architecture:** 
1. Fix GitHub Actions test environment to pass SQLite credentials to Pest regardless of `phpunit.xml` defaults.
2. Establish `.github/dependabot.yml` targeting `development` with grouped updates.
3. Retarget open PRs to `development`, execute merge sequence in lockfile dependency order.
4. Update remaining vulnerable packages in local lockfiles on `security/resolve-dependency-alerts`, verify quality/tests, and PR to `development`.

**Tech Stack:** GitHub Actions, Dependabot, PHP / Composer (Laravel 12), Node.js / npm, GitHub CLI (`gh`).

---

### Task 1: Fix CI Pest Test Environment in `.github/workflows/tests.yml`

**Files:**
- Modify: [.github/workflows/tests.yml:61-71](file:///c:/xampp/htdocs/jurnal_mu/.github/workflows/tests.yml#L61-L71)

- [ ] **Step 1: Check existing test execution environment settings**

Examine [.github/workflows/tests.yml](file:///c:/xampp/htdocs/jurnal_mu/.github/workflows/tests.yml) lines 61-71. Note that `Configure Testing Environment` and `Run Tests (Pest)` lack explicit `env:` overrides for `DB_CONNECTION` and `DB_DATABASE`, allowing [phpunit.xml](file:///c:/xampp/htdocs/jurnal_mu/phpunit.xml) to force `mysql:3306`.

- [ ] **Step 2: Update `.github/workflows/tests.yml`**

Provide explicit SQLite environment variables to the migration and Pest test steps:

```yaml
      - name: Configure Testing Environment
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: database/database.sqlite
        run: |
          mkdir -p database
          touch database/database.sqlite
          sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
          sed -i 's/DB_DATABASE=jurnal_mu/DB_DATABASE=database\/database.sqlite/' .env
          php artisan migrate:fresh --seed --force

      - name: Run Tests (Pest)
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: database/database.sqlite
        run: ./vendor/bin/pest
```

- [ ] **Step 3: Verify syntax of `.github/workflows/tests.yml`**

Run locally to ensure YAML is valid:
```bash
pwsh -NoProfile -Command "Get-Content .github/workflows/tests.yml | Out-Null; Write-Output 'YAML syntax valid'"
```

- [ ] **Step 4: Commit changes to CI workflow**

```bash
git add .github/workflows/tests.yml
git commit -m "fix(ci): inject sqlite env to pest in tests workflow"
```

---

### Task 2: Create `.github/dependabot.yml` Configuration

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Write `.github/dependabot.yml`**

Create `.github/dependabot.yml` configured to target `development` branch with grouped updates:

```yaml
version: 2
updates:
  - package-ecosystem: "composer"
    directory: "/"
    target-branch: "development"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      composer-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "npm"
    directory: "/"
    target-branch: "development"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      npm-dependencies:
        patterns:
          - "*"
```

- [ ] **Step 2: Verify file existence and formatting**

```bash
pwsh -NoProfile -Command "Get-Content .github/dependabot.yml"
```

- [ ] **Step 3: Commit `.github/dependabot.yml`**

```bash
git add .github/dependabot.yml
git commit -m "ci(dependabot): add dependabot config targeting development with grouped updates"
```

---

### Task 3: Retarget and Merge 13 Open Dependabot PRs into `development`

**Files:**
- GitHub remote Pull Requests (#267, #266, #265, #264, #260, #253, #252, #251, #250, #247, #246, #245, #244)

- [ ] **Step 1: Retarget all 13 open PRs to `development`**

Run gh command to switch base of all open Dependabot PRs:
```bash
pwsh -NoProfile -Command "
$prs = @(264, 246, 267, 266, 265, 260, 253, 252, 251, 250, 247, 245, 244)
foreach ($pr in $prs) {
    gh pr edit $pr --base development
    Write-Output \"PR #$pr base set to development\"
}
"
```

- [ ] **Step 2: Merge Composer PRs first**

1. Check and merge PR #264 (`league/commonmark`):
   ```bash
   gh pr merge 264 --squash --delete-branch
   ```
2. Check and merge PR #246 (`guzzlehttp/guzzle`):
   ```bash
   gh pr merge 246 --squash --delete-branch
   ```

- [ ] **Step 3: Merge remaining NPM PRs sequentially**

Merge safe npm PRs (#266 `@humanfs/node`, #265 `postcss-selector-parser`, #267 `fast-uri`, #260, #253, #252, #251, #250, #247, #245, #244):
```bash
pwsh -NoProfile -Command "
$npmPrs = @(266, 265, 267, 260, 253, 252, 251, 250, 247, 245, 244)
foreach ($pr in $npmPrs) {
    try {
        gh pr merge $pr --squash --delete-branch
        Write-Output \"PR #$pr merged successfully\"
    } catch {
        Write-Warning \"PR #$pr failed to merge, needs rebase: $_\"
    }
}
"
```

---

### Task 4: Resolve Residual Vulnerabilities via Consolidated Branch

**Files:**
- Modify: [composer.json](file:///c:/xampp/htdocs/jurnal_mu/composer.json)
- Modify: `composer.lock`
- Modify: [package.json](file:///c:/xampp/htdocs/jurnal_mu/package.json)
- Modify: `package-lock.json`

- [ ] **Step 1: Checkout updated `development` and create branch**

```bash
git checkout development
git pull origin development
git checkout -b security/resolve-dependency-alerts
```

- [ ] **Step 2: Update Composer dependencies**

Run composer update for packages with security advisories:
```bash
composer update laravel/framework symfony/* guzzlehttp/* league/commonmark --with-all-dependencies
```

- [ ] **Step 3: Verify composer security audit**

```bash
composer audit
```
Expected: 0 vulnerabilities or critical/high eliminated.

- [ ] **Step 4: Update NPM dependencies & fix critical packages**

1. Run automated fix:
   ```bash
   npm audit fix
   ```
2. Upgrade critical packages if not patched by audit fix:
   - Check `vitest` (ensure `>= 4.1.0` or updated dev dependency)
   - Check `axios` (ensure `>= 1.18.0`)
   - Check `shell-quote` (ensure `>= 1.8.4`)
   - Check `tar` (ensure `>= 7.5.19`)

- [ ] **Step 5: Run full local quality verification**

1. Lint & styling:
   ```bash
   ./vendor/bin/pint --test
   npm run format:check
   npm run types
   ```
2. Asset build:
   ```bash
   npm run build
   ```
3. Pest test suite:
   ```bash
   ./vendor/bin/pest
   ```

- [ ] **Step 6: Commit and create PR to `development`**

```bash
git add composer.json composer.lock package.json package-lock.json
git commit -m "fix(security): resolve residual dependabot alerts and bump critical packages"
git push origin security/resolve-dependency-alerts
gh pr create --base development --title "fix(security): resolve residual dependabot alerts" --body "Consolidated update to remediate critical, high, and medium Dependabot alerts."
```

---

### Task 5: Merge Consolidated PR & Final Dependabot Verification

**Files:**
- GitHub Dependabot Dashboard / API

- [ ] **Step 1: Wait for CI checks on consolidated PR**

```bash
gh pr checks
```
Ensure `PR Quality Checks` and `tests` succeed on `development`.

- [ ] **Step 2: Merge consolidated PR into `development`**

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 3: Query open Dependabot alerts to verify remediation**

```bash
gh api --paginate "repos/kyASse/jurnal_mu/dependabot/alerts?state=open" --jq '[.[] | {severity: .security_advisory.severity, package: .dependency.package.name}] | group_by(.severity) | map({severity: .[0].severity, count: length})'
```
Expected: Critical alerts count = 0, high alerts resolved or drastically reduced.
