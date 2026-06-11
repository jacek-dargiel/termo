# AGENTS

## Repo Facts That Matter
- Single Angular v22 application (not a monorepo). Entrypoint is `src/main.ts` with standalone `bootstrapApplication` and NgRx store/effects wired there.
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
- **CI pipeline** (GitHub Actions): lint → test → e2e:ci runs on every PR and push to master.
- **Deploy** (GitHub Actions → Netlify Build Hook): on push to master, after CI passes, fires a hook that triggers Netlify deploy: `npm run build && npm run post-deploy`.
- Full local build simulation: `npm run deploy` (build + post-deploy only).

## External Rule Loading
- CRITICAL: When you see a rules file reference (for example `@.agents/rules/unit-tests.instructions.md`), use the Read tool and load it only when relevant to the current task.
- Do not preload all rule files; use lazy loading based on what you are editing (unit tests vs e2e).
- Treat loaded rules as mandatory task-specific instructions.
- Unit-test guidance: `@.agents/rules/unit-tests.instructions.md`.
- E2E guidance: `@.agents/rules/e2e.instructions.md`.
- ADR guidance: `@.agents/rules/adr.instructions.md`. Read before proposing or writing any Architecture Decision Record.

## Coding Style Preferences
- Prefer `date-fns` for date/time math and formatting.
- Follow workspace defaults: 2-space indentation, SCSS for component styles, selector prefix `termo`.
- **Dependency injection field naming:** Use explicit, type-revealing field names (`readonly locationFacade = inject(LocationFacade)`), never generic names like `this.facade`. Prefer `private` visibility; use `readonly` / `protected` only when the template needs direct access.
- **State management:** Prefer observables and signals over promises. Do not convert observables to promises (`firstValueFrom`, `toPromise`). Use observable chaining (`pipe`, `switchMap`, `forkJoin`) for sequencing async work. Subscribe explicitly when firing side effects.
- **Template clean architecture:** HTML templates must not reference injected services or facades directly. Components expose the specific signals the template needs as class properties (e.g., `readonly isLoading = this.locationFacade.isLoading`).
- **Declarative over imperative:** Use `Object.entries` / `Object.fromEntries` / `Array.flatMap` / `Array.filter` / `Array.map` / `Array.reduce` over `for…of` loops with mutable accumulator objects.


## Infra/Environment Details
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect is templated in `netlify.toml.template`; `post-deploy` generates `netlify.toml` via `envsub`.
- Runtime in `package.json` expects Node `24.x`.

## Architecture Decisions
- `docs/adr/README.md` — Index of all ADRs. Read before making structural changes to understand past decisions.
- ADR format and rules: `.agents/rules/adr.instructions.md`.

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
