# Migrate CI Pipeline from Netlify to GitHub Actions

> **Status:** Plan — ready for implementation
> **For Hermes:** Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Move the CI gating pipeline (lint, unit tests, e2e tests) from Netlify to GitHub Actions, using a **Netlify Build Hook** to trigger deploys from the passing workflow.

**Architecture:** GitHub Actions runs the full gate (lint, test, e2e) on every PR and push to master. On push to master, after all checks pass, it fires a Netlify Build Hook via `curl` to trigger the production build and deploy. Netlify's auto-deployment on git push is disabled — the only way to trigger a build is through the hook, ensuring CI always passes before deploy. This eliminates the e2e timeout on Netlify and guarantees the gate is enforced in a friendlier environment (GitHub Actions Ubuntu runners with proper Playwright system deps).

**Tech Stack:** GitHub Actions (ubuntu-latest, Node 24.x), Playwright 1.55.1, Angular 22, Netlify Build Hooks

---

## Current State

### Netlify Build Command (set in Netlify UI)

```
npm run deploy
```

Where `deploy` = `npm run lint && npm run test && npm run e2e-setup && npm run e2e:ci && npm run build && npm run post-deploy`

Netlify runs **everything**. The e2e step (Playwright webServer) hangs on Netlify's build infra but works fine on GitHub Actions. 18-minute timeout kills the build.

### Relevant Files

| File | Purpose |
|------|---------|
| `package.json` | `deploy` script chains all steps |
| `playwright.config.ts` | Playwright config with webServer (`npx ng serve`) |
| `bin/sentry-release.sh` | Creates Sentry release after build |
| `netlify.toml.template` | Netlify redirect rules (generated at deploy time) |
| `netlify.toml` | Generated from template, gitignored |

---

## Proposed Design

### Flow Diagram

```
Pull request to master:
  GitHub Actions: lint → test → e2e  (gate only, no deploy)

Push to master (post-merge):
  GitHub Actions: lint → test → e2e → curl Netlify Build Hook
                                        ↓
                                  Netlify: build → post-deploy → deploy
```

### Split Responsibilities

| Concern | Where |
|---------|-------|
| `lint` | GitHub Actions |
| `test` (unit) | GitHub Actions |
| `e2e-setup` + `e2e:ci` | GitHub Actions |
| `build` (production) | Netlify (via build hook) |
| `post-deploy` (envsub + sentry) | Netlify (via build hook) |
| Deploy to production | Netlify (via build hook) |
| Lighthouse report | Netlify (unchanged — runs after deploy) |
| Prerender extension | Netlify (unchanged) |

### GitHub Actions Workflow

Single workflow `.github/workflows/ci.yml`:

- **Triggers:**
  - `pull_request` targeting `master` — gate only
  - `push` to `master` — gate + deploy
- **Node version:** 24.x
- **Steps (sequential):**
  1. Checkout repo
  2. Setup Node + npm cache
  3. `npm ci`
  4. `npx playwright install --with-deps`
  5. `npm run lint`
  6. `npm run test`
  7. `npm run e2e:ci`
  8. **Deploy** (only on push to master): `curl -X POST -d {} ${{ secrets.NETLIFY_BUILD_HOOK }}`

### Netlify Changes

| What | Before | After |
|------|--------|-------|
| Build command | `npm run deploy` | `npm run build && npm run post-deploy` |
| Auto-deployment | Enabled (on git push) | **Disabled** |
| Build hook | None | Create one named "GitHub CI" for `master` branch |

Disabling auto-deployment ensures no deploy happens unless the build hook fires. The build hook URL is stored as a GitHub Actions secret (`NETLIFY_BUILD_HOOK`).

### Package.json Changes

No structural changes. Optionally add a convenience script:

```json
"netlify-deploy": "npm run build && npm run post-deploy"
```

The existing `deploy` script stays for local full-pipeline testing. The `post-deploy` script is unchanged:
```
envsub ./dist/browser/index.html && envsub netlify.toml.template netlify.toml && npm run sentry-release
```

---

## Tasks

### Task 1: Create the GitHub Actions workflow file

**Objective:** Create `.github/workflows/ci.yml` with lint, test, e2e, and conditional deploy step.

**Files:**
- Create: `.github/workflows/ci.yml`

**Content:**

```yaml
name: CI

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test

      - name: E2E tests
        run: npm run e2e:ci

      - name: Trigger Netlify deploy
        if: github.ref == 'refs/heads/master' && github.event_name == 'push'
        run: curl -X POST -d {} ${{ secrets.NETLIFY_BUILD_HOOK }}
```

**Key design decisions:**
- Deploy step only fires on push to master (not on PR), guarded by `if` condition
- `--with-deps` on `playwright install` installs system libraries via apt — essential on Ubuntu runner
- `timeout-minutes: 20` — generous for all steps combined but avoids hanging forever
- Concurrency group cancels in-progress runs when a new push arrives on the same branch
- Node 24.x matches the engine requirement in `package.json`
- `npm ci` uses lockfile for reproducible installs

**Verification:**
- Create the file, push to a branch, open a PR → workflow should run (but skip deploy step)
- Merge PR → workflow runs again on master push, including the deploy step

---

### Task 2: Set up Netlify Build Hook and settings

**Objective:** Create the build hook, store its URL as a GitHub secret, disable auto-deployment, simplify build command.

**Files:** None (all done in Netlify UI + GitHub UI)

**Steps:**

1. **Netlify: Create Build Hook**
   - Go to Netlify dashboard → Site → Deploys → Deployment Settings → Continuous Deployment → **Build hooks**
   - Click **Add build hook**
   - Name: `GitHub CI`
   - Branch: `master`
   - Click **Save**
   - **Copy the generated URL** immediately — it won't be shown again

2. **GitHub: Add secret**
   - Go to repo → Settings → Secrets and variables → Actions → **New repository secret**
   - Name: `NETLIFY_BUILD_HOOK`
   - Value: paste the URL from step 1
   - Click **Add secret**

3. **Code: Simplify deploy script**
   - In `package.json`, the `deploy` script is already changed from `npm run lint && npm run test && npm run e2e-setup && npm run e2e:ci && npm run build && npm run post-deploy` to just `npm run build && npm run post-deploy`
   - No UI change needed — Netlify's build command stays as `npm run deploy`

4. **Netlify: Disable auto-deployment**
   - In the same settings page, under **Deploy settings** section
   - Uncheck "Auto deploy on git push" or set it to "Stop building on git push" depending on the UI version
   - This ensures only the build hook triggers deploys

**Verification:**
- Push a non-breaking commit to master → should NOT trigger Netlify build automatically
- Check GitHub Actions → workflow should run → after e2e passes, curl step fires
- Check Netlify Deploys → a new deploy should appear (triggered by the hook)

---

### Task 3: Update AGENTS.md documentation

**Objective:** Document the new CI architecture in AGENTS.md.

**Files:**
- Modify: `AGENTS.md`

**Changes:**

Update the Commands section (lines 11-17) to reflect the split:

```markdown
## Commands (Source of Truth: `package.json`)
- Install deps: `npm ci`.
- Dev server: `npm start` (uses `proxy.conf.json`).
- Lint: `npm run lint`.
- Unit tests: `npm test`. Single spec: `npm run test:file -- <path>`.
- E2E: `npm run e2e` (local — playwright-ng-schematics) or `npm run e2e:ci` (CI — Playwright webServer auto-manages `ng serve` lifecycle).
  Single spec: `npx playwright test e2e/termo.spec.ts`.
- **CI pipeline** (GitHub Actions): lint → test → e2e:ci runs on every PR and push to master.
- **Deploy** (GitHub Actions → Netlify Build Hook): on push to master, after CI passes, fires a hook that triggers Netlify build + deploy: `npm run build && npm run post-deploy`.
- Full local build simulation: `npm run deploy` (runs everything).
```

Also add a line about the build hook in the Infra section (line 36-39):

```markdown
## Infra/Environment Details
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect is templated in `netlify.toml.template`; `post-deploy` generates `netlify.toml` via `envsub`.
- Runtime in `package.json` expects Node `24.x`.
- **Deployment:** GitHub Actions triggers Netlify build hook on push to master. Netlify auto-deploy is disabled. The hook URL is stored as `NETLIFY_BUILD_HOOK` in GitHub Actions secrets.
```

**Verification:**
- Read `AGENTS.md` and confirm the commands and infra sections are accurate

---

## Risks and Open Questions

### Risks

1. **Build hook URL is a secret.** If leaked, anyone can trigger a build. GitHub Actions secrets are encrypted at rest and only injected into the workflow run. No risk in normal operation.

2. **Playwright system deps on Ubuntu runner.** GitHub Actions Ubuntu runners have most dependencies pre-installed, but `--with-deps` is the safety net. Adds ~30s to install step.

3. **Playwright browser download each run.** Without explicit caching, each run downloads ~400MB of browsers. Consider adding an `actions/cache` step for `~/.cache/ms-playwright` as a follow-up optimization. Not a blocker — Playwright team says the download takes ~20s on typical GitHub Actions runners.

4. **Sentry release is tied to Netlify.** `post-deploy` runs `sentry-cli` which needs `SENTRY_AUTH_TOKEN` (already set in Netlify env vars). If we ever move to a fully GHA-managed deploy, we'd need to add that token to GitHub secrets. Out of scope for now.

5. **Ordering: UI changes first.** The Netlify settings changes (disable auto-deploy, simplify build command) must happen **before** the first workflow run that triggers the build hook. Otherwise, an auto-deploy could kick off before the build command is simplified, running the old `deploy` script with the timeout risk. Mitigation: do all Netlify UI changes FIRST, merge the workflow PR after.

### Open Questions

1. **Should the production build also run in GitHub Actions as a validation step?** Currently Netlify is the only place `ng build --configuration production` runs. Adding it to the workflow (before the hook curl) would catch build errors faster and at zero cost. Takes ~10s. Easy add to Task 1 if desired.

2. **Developer visibility.** After migration, a developer who pushes to master sees the build result in GitHub Actions (checks tab), but the deploy status is on Netlify. Consider adding a GitHub check that reports the Netlify deploy status (Netlify offers a GitHub app for this) — nice-to-have, not required.

---

## Verification Plan

1. Make all Netlify UI changes (build hook, disable auto-deploy, simplify build command)
2. Create `.github/workflows/ci.yml` in a branch
3. Open a PR → confirm workflow runs lint/test/e2e only (no deploy step)
4. Merge the PR → confirm workflow runs again on master push
5. After CI passes, confirm the curl step fires
6. Check Netlify Deploys → a new deploy is building with the simplified command
7. Deploy completes, site is live
8. Push another change to master → same flow, no auto-deploy bypass

## Rollback

| Issue | Recovery |
|-------|----------|
| Netlify deploy broken | Change build command back to `npm run deploy` in UI, re-enable auto-deploy |
| GHA workflow broken | Push a revert of the workflow file |
| Build hook misconfigured | Delete the hook, create a new one, update the secret |
