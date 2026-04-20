# AGENTS

## Fast Facts
- Single-package Angular app (not a monorepo); main entrypoint is `src/main.ts` using standalone bootstrap (`bootstrapApplication`) with NgRx effects/store wired there.
- State feature names and paths intentionally use the typo `measurment` (actions/reducer/service/files). Reuse that spelling when editing existing code.
- Runtime API base is `environment.API_URL` (`/api` in both env files), prepended in `src/app/services/api.service.ts`.

## Commands You Should Actually Use
- Install: `npm ci` (repo uses npm lockfile and `angular.json` sets package manager to npm).
- Dev server: `npm start` (uses proxy config from `proxy.conf.json`).
- Lint: `npm run lint`.
- Unit tests: `npm test` (Jest, not Karma).
- Single unit test file: `npm test -- src/app/path/to/file.spec.ts`.
- Update Jest snapshots: `npm test -- -u`.
- E2E with auto dev server: `npm run e2e` (Angular builder wraps Playwright).
- Focused Playwright run: start app separately, then `npx playwright test e2e/termo.spec.ts`.

## Testing/Tooling Gotchas
- Jest is configured via `jest.config.js` with `jest-preset-angular` + zoneless setup in `setup-jest.ts`; ignore old Karma assumptions.
- Snapshot files live under `src/**/__snapshots__/*.snap`; UI tests commonly assert snapshots.
- RxJS/NgRx tests in this repo heavily use `jest-marbles`; follow that style for effects/selectors/facades.
- E2E tests are in `e2e/*.spec.ts`; config is `playwright.config.ts` (no `webServer` block, so direct Playwright runs need a running app).

## API/Infra Details That Affect Changes
- Dev proxy rewrites `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (`proxy.conf.json`).
- Production redirect template is `netlify.toml.template`; deployment runs `envsub` to generate `netlify.toml` and inject env vars.
- Full deploy script order is fixed in `package.json`: lint -> test -> e2e setup -> e2e -> build -> post-deploy.

## Existing Instruction Sources
- Additional test-writing guidance exists in `.github/instructions/tests.instructions.md` and `.github/instructions/e2e.instructions.md` (mirrored in `.cursor/rules/`).
- Treat repository config/scripts as source of truth when those docs conflict (for example, test runner is Jest via `npm test`).
