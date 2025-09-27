[x] map.facade.spec.ts - Write more comprehensive tests for selectLocation
[x] Add selector tests
[x] Add reducer tests
[ ] Add sentry error handler tests
[x] Reevaluate the tests
[x] Effects tests
    [x] Unignore refreshMeasurments$ tests
    [x] Write resetSignalOnMeasurmentsFinished$ tests
[x] Lodash - check if there's better ways to include it, to not trigger optimization bailouts
[x] Lodash - remove it altogether. It's 2025.
[x] Check for swimlane charts update (also optimization bailouts)
    [x] Check if it still requires d3-color@2
[x] Add playwright
    [x] Remove termo-e2e from angular.json
[x] Implement some playwright E2E tests
    [x] n map locations are shown
    [x] Loading indicator show while loading
    [x] Expected name, temperature and min-temperature values are shown
    [x] 'Outdated' warnings are shown
    [x] Clicking a location opens the chart. An actual chart is visible.
    [x] Refresh button works
    [x] Autorefresh works
[x] Evaluate usage of strictTemplates
[x] Run A19 migrations and test
    [x] Build system migration
    [x] Standalone components
        [x] Reenable ESLint rule @angular-eslint/prefer-standalone
    [x] Control Flow syntax
    [x] inject() function
    [x] input() API
    [x] output() function
    [x] Queries as signals
    [x] Self-closing tags
    [x] Unused import
[x] Update ESLint to v9 with flat config.
[x] Update to A20
[x] Evaluate package.json packages, update.
[x] npm audit
[ ] Fix measurments typo.
[ ] Use `host` on `@Component` instead of `@HostBinding` and `@HostListener` https://angular.dev/guide/components/host-elements#binding-to-the-host-element
    [ ] Enable host binding type checking in `angularCompilerOptions`.
[ ] Hide locations delayed by several days.
[ ] Refactor to signal store.
[ ] Refactor to github actions
[ ] migrate to angular's built-in experimental vitest framework (vitest promises easy migration from jest) https://angular.dev/guide/testing/unit-tests
[ ] Evaluate Zoneless.
