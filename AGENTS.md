# AGENTS

## Repo Facts That Matter
- Single Angular v21 application (not a monorepo). Entrypoint is `src/main.ts` with standalone `bootstrapApplication` and NgRx store/effects wired there.
- App runs zoneless (`provideZonelessChangeDetection()` in `src/main.ts`), so keep tests and app code compatible with zoneless behavior.
- State/service naming intentionally uses typo `measurment` across files and feature keys; keep that spelling when touching existing code.
- API calls are always prefixed in `src/app/services/api.service.ts` with `environment.API_URL` (`/api` in both env files).

## Commands (Source of Truth: `package.json`)
- Install deps: `npm ci`.
- Dev server: `npm start` (uses `proxy.conf.json`).
- Lint: `npm run lint`.
- Unit tests (Vitest via Angular test builder): `npm test`.
- Run one unit spec: `npm run test:file -- src/app/path/to/file.spec.ts`.
- Legacy Jest-spec complexity ranking: `npm run test:legacy:rank -- --top 10` (or `--json`).
- E2E with auto dev server: `npm run e2e`.
- Direct Playwright run: start app first, then `npx playwright test e2e/termo.spec.ts` (no `webServer` in `playwright.config.ts`).
- Deploy pipeline order is fixed: `lint -> test -> e2e-setup -> e2e -> build -> post-deploy`.

## Testing Migration Gotchas
- Unit test target includes only `src/**/*.spec.ts` (`angular.json` + `src/tsconfig.spec.json`), so `*.jest-spec.ts` files are intentionally excluded from normal `npm test` runs.
- Project is on Vitest now (`vitest` + `@angular/build:unit-test`); do not add new Jest-based tests.
- Legacy tests are intentionally kept as `*.jest-spec.ts` for migration reference; use provided migration skills instead of deleting blindly.

## External Rule Loading
- CRITICAL: When you see a rules file reference (for example `@.agents/rules/unit-tests.instructions.md`), use the Read tool and load it only when relevant to the current task.
- Do not preload all rule files; use lazy loading based on what you are editing (unit tests vs e2e).
- Treat loaded rules as mandatory task-specific instructions.
- Unit-test guidance: `@.agents/rules/unit-tests.instructions.md`.
- E2E guidance: `@.agents/rules/e2e.instructions.md`.

## Coding Style Preferences
- Prefer `date-fns` for date/time math and formatting.
- For RxJS behavior tests, prefer marble tests with `@granito/vitest-marbles`.
- Follow workspace defaults: 2-space indentation, SCSS for component styles, selector prefix `termo`.

## Infra/Environment Details
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect is templated in `netlify.toml.template`; `post-deploy` generates `netlify.toml` via `envsub`.
- Runtime in `package.json` expects Node `24.x`.

## Agent-Specific Tooling
- OpenCode MCP config is in `opencode.json`.
- `angular-cli` MCP is available for Angular docs/project-aware tooling.
- `grounded-docs` MCP is available; use it for up-to-date Vitest docs when needed.
- Repo includes migration skills under `.agents/skills/`: `test-rewrite-planner` and `legacy-jest-complexity-ranker`.
