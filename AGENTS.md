# AGENTS

## Repo Facts That Matter
- Single Angular v21 application (not a monorepo). Entrypoint is `src/main.ts` with standalone `bootstrapApplication` and NgRx store/effects wired there.
- App runs zoneless (`provideZonelessChangeDetection()` in `src/main.ts`), so **every** component test must include `provideZonelessChangeDetection()` in `TestBed.configureTestingModule` providers — missing it causes hangs or silent test failures.
- API calls are always prefixed in `src/app/services/api.service.ts` with `environment.API_URL` (`/api` in both env files).
- `src/app/interfaces` is a **file** (`interfaces.ts`), not a directory. Running `read src/app/interfaces` fails — use `src/app/interfaces.ts`.
- `python` is not installed; write temporary scripts in bash or JS (Node) instead.
- There is **no** `jest.config.js`, `vitest.config.ts`, or standalone `test.ts`. All test config lives in `angular.json` under the test target. Don't search for them.

## Commands (Source of Truth: `package.json`)
- Install deps: `npm ci`.
- Dev server: `npm start` (uses `proxy.conf.json`).
- Lint: `npm run lint`.
- Unit tests: `npm test`. Single spec: `npm run test:file -- <path>`.
- E2E: `npm run e2e`. Direct Playwright: `npx playwright test e2e/termo.spec.ts`.
- Deploy pipeline order is fixed: `lint -> test -> e2e-setup -> e2e -> build -> post-deploy`.

## External Rule Loading
- CRITICAL: When you see a rules file reference (for example `@.agents/rules/unit-tests.instructions.md`), use the Read tool and load it only when relevant to the current task.
- Do not preload all rule files; use lazy loading based on what you are editing (unit tests vs e2e).
- Treat loaded rules as mandatory task-specific instructions.
- Unit-test guidance: `@.agents/rules/unit-tests.instructions.md`.
- E2E guidance: `@.agents/rules/e2e.instructions.md`.

## Coding Style Preferences
- Prefer `date-fns` for date/time math and formatting.
- Follow workspace defaults: 2-space indentation, SCSS for component styles, selector prefix `termo`.

## Infra/Environment Details
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect is templated in `netlify.toml.template`; `post-deploy` generates `netlify.toml` via `envsub`.
- Runtime in `package.json` expects Node `24.x`.

## Agent-Specific Tooling
- OpenCode MCP config is in `opencode.json`.
- `angular-cli` MCP is available for Angular docs/project-aware tooling.
- `grounded-docs` MCP is available; use it for up-to-date Vitest docs when needed.

## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI in the `jacek-dargiel/termo` repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
