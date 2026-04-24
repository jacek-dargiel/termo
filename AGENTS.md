# AGENTS

## Repo Facts That Matter
- Single Angular v21 application (not a monorepo). Entrypoint is `src/main.ts` with standalone `bootstrapApplication` and NgRx store/effects wired there.
- App runs zoneless (`provideZonelessChangeDetection()` in `src/main.ts`), so **every** component test must include `provideZonelessChangeDetection()` in `TestBed.configureTestingModule` providers — missing it causes hangs or silent test failures.
- State/service naming intentionally uses typo `measurment` across files and feature keys; keep that spelling when touching existing code.
- API calls are always prefixed in `src/app/services/api.service.ts` with `environment.API_URL` (`/api` in both env files).
- `src/app/interfaces` is a **file** (`interfaces.ts`), not a directory. Running `read src/app/interfaces` fails — use `src/app/interfaces.ts`.
- `python` is not installed; write temporary scripts in bash or JS (Node) instead.
- There is **no** `jest.config.js`, `vitest.config.ts`, or standalone `test.ts`. All test config lives in `angular.json` under the test target. Don't search for them.

## Commands (Source of Truth: `package.json`)
- Install deps: `npm ci`.
- Dev server: `npm start` (uses `proxy.conf.json`).
- Lint: `npm run lint`.
- Unit tests (Vitest via Angular test builder): `npm test`.
- Run one unit spec: `npm run test:file -- src/app/path/to/file.spec.ts` (**not** `npm test -- <file>` — that fails with `Error: Unknown`).
- Legacy Jest-spec complexity ranking: `npm run test:legacy:rank -- --top 10` (or `--json`).
- E2E with auto dev server: `npm run e2e`.
- Direct Playwright run: start app first, then `npx playwright test e2e/termo.spec.ts` (no `webServer` in `playwright.config.ts`).
- Deploy pipeline order is fixed: `lint -> test -> e2e-setup -> e2e -> build -> post-deploy`.

## Testing Migration Gotchas
- Unit test target includes only `src/**/*.spec.ts` (`angular.json` + `src/tsconfig.spec.json`), so `*.jest-spec.ts` files are intentionally excluded from normal `npm test` runs.
- Project is on Vitest now (`vitest` + `@angular/build:unit-test`); do not add new Jest-based tests. Use `vi.restoreAllMocks()`, not `jest.restoreAllMocks()`.
- Legacy tests are intentionally kept as `*.jest-spec.ts` for migration reference; use provided migration skills instead of deleting blindly.
- LSP errors like `Cannot find name 'describe'` on `*.jest-spec.ts` files are expected noise (they use Jest globals but only Vitest types are configured). Ignore them.
- Legacy tests use the deprecated `inject()` from `@angular/core/testing`: `inject([Service], (s) => {...})`. New Vitest specs must use `TestBed.inject(Service)`.
- `jest-migration-report.md` is the canonical migration tracker — regenerated from `npm run test:legacy:rank -- --json`. Re-rank between rewrites: the easiest remaining target shifts after each migration.

## TestBed Patterns (Do NOT Guess These)
- **Component tests**: must include `provideZonelessChangeDetection()` in providers.
- **HttpClient tests**: use `provideHttpClient()` + `provideHttpClientTesting()` (not `HttpClientTestingModule`). Call `httpTesting.verify()` in `afterEach`.
- **Standalone child stubs**: declare stubs with `standalone: true` and wire via `TestBed.overrideComponent({ set: { imports: [...] } })`. Old `declarations`-based patterns silently don't work.
- **Services without `providedIn`** (e.g. `LocationService`): must be listed explicitly in `TestBed` providers.
- **Pipes without DI** (e.g. `ToFixedPipe`): use `new ThePipe()`, no TestBed needed.
- **Pipes using `inject()`** (e.g. `RelativeTimePipe`): use `TestBed.runInInjectionContext(() => new ThePipe())`, not `TestBed.inject(ThePipe)`.
- **`@granito/vitest-marbles`** has a module-level `afterEach` that flushes the `TestScheduler`. Global mocks set in tests (e.g. `globalThis.Image`) must NOT be restored in the spec's own `afterEach` — the marble `afterEach` runs last.
- **NgRx actions** use class-based `new ActionClass(payload)`, not `createAction`. Tests must instantiate with `new`, e.g. `new RefreshMeasurmentsOnBtnClick({ locationId: 'loc-a' })`.
- **`INITIAL_STATE`** (uppercase, `location.reducer.ts`) vs **`initialState`** (lowercase, `measurment.reducer.ts`) — two different export names across reducers. Check the source, don't guess.

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
- Environment values (e.g. `THRESHOLD_MS`) should be hardcoded as raw numbers in tests rather than importing environment modules.

## Infra/Environment Details
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect is templated in `netlify.toml.template`; `post-deploy` generates `netlify.toml` via `envsub`.
- Runtime in `package.json` expects Node `24.x`.

## Agent-Specific Tooling
- OpenCode MCP config is in `opencode.json`.
- `angular-cli` MCP is available for Angular docs/project-aware tooling.
- `grounded-docs` MCP is available; use it for up-to-date Vitest docs when needed.
- Repo includes migration skills under `.agents/skills/`: `test-rewrite-planner` and `legacy-jest-complexity-ranker`.
- Test-rewrite-planner reference prompts live at `.agents/skills/test-rewrite-planner/references/`.
- Always trust the `test:legacy:rank` script over ad-hoc subagent complexity judgments for picking the next migration target.
