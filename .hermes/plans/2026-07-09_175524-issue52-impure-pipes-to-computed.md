# Issue #52: Replace impure RelativeTimePipe with `computed()` in component

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Eliminate the `pure: false` pipes `RelativeTimePipe` and `IsLocationOutdatedPipe` by inlining the clock and formatting logic as signals directly in `MapLocationComponent`. Also remove the `TERMO_CURRENT_TIME_FACTORY` injection token since nothing will use it anymore.

**Architecture:** `MapLocationComponent` becomes fully self-contained for time concerns. It owns a private signal for "now" that ticks every 60 seconds via `setInterval` in its constructor, cleaned up through `DestroyRef`. Two public `computed()` signals — one for the relative time string, one for the outdated boolean — derive from the location's `updatedAt` and the component's own clock. No new services, no utility files, no injection tokens. The `ToFixedPipe` stays since it has no time dependency.

**Tech Stack:** Angular 22, signals, zoneless change detection, date-fns, Vitest.

---

## Tasks

### Task 1: Add clock signal and computed signals to MapLocationComponent

**Objective:** Add a private `now` signal that auto-refreshes every 60 seconds. Add two public `computed()` signals that replace the logic of the two pipes being removed. Update the template to use signal bindings instead of pipe syntax.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.ts`
- Modify: `src/app/components/map-location/map-location.component.html`

**What to do:**

In the component class:
- Add `computed`, `signal`, `DestroyRef`, `inject` to the Angular imports
- Add the required `date-fns` functions to the existing `date-fns` import: `isBefore`, `subDays`, `subHours`, `subMilliseconds`, `differenceInCalendarDays`, `differenceInHours`, `differenceInMinutes`
- Import `environment` from `environments/environment`
- Remove imports of `IsLocationOutdatedPipe` and `RelativeTimePipe`
- Remove `IsLocationOutdatedPipe` and `RelativeTimePipe` from the component's `imports` array
- Inject `DestroyRef`
- Add a private `now` signal initialised to `new Date()`. In the constructor, call `setInterval` every 60 seconds to update it and register cleanup via `destroyRef.onDestroy`
- Add a public readonly `relativeTime` computed that takes `location().updatedAt` and `now()`, applying the same branching logic from the old pipe: 2+ days → "X dni", 2+ hours → "X godz.", otherwise → "X min."
- Add a public readonly `isOutdated` computed that checks if `location().updatedAt` is older than `now() - environment.locationOutdatedThreshold` using `subMilliseconds` and `isBefore`

In the template:
- Replace `location().updatedAt | isLocationOutdated` with `isOutdated()`
- Replace `location().updatedAt | relativeTime` with `relativeTime()`

**Verification:** The `relativeTime` computed produces identical strings to the old `RelativeTimePipe.transform()` for the same input. The `isOutdated` computed produces identical booleans to `IsLocationOutdatedPipe.transform()` for the same input. The 60-second interval won't fire in tests that use `vi.useFakeTimers()`.

**Commit message:** `refactor: replace impure time pipes with computed() in MapLocationComponent`

---

### Task 2: Delete old pipes, token, and their specs

**Objective:** Remove dead code. The pipes and injection token are no longer imported anywhere.

**Files:**
- Delete: `src/app/pipes/relative-time.pipe.ts`
- Delete: `src/app/pipes/relative-time.pipe.spec.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.spec.ts`
- Delete: `src/app/pipes/current-time.injection-token.ts`
- Modify: `src/main.ts`

**What to do:**

First, verify no remaining references:
- Search the `src/` tree for any remaining imports of `relative-time.pipe`, `is-location-outdated.pipe`, or `current-time.injection-token` — expected result: none, since Task 1 removed the last consumer.

Then remove from `main.ts`:
- Remove the import of `TERMO_CURRENT_TIME_FACTORY` from `current-time.injection-token`
- Remove the provider `{ provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() }`
- The remaining providers stay as-is

Then delete all five pipe/token files.

**Verification:** `npm run lint` passes (no broken imports). `npm test` passes (no spec files reference deleted sources). `npm run build` succeeds.

**Commit message:** `refactor: remove impure time pipes and TERMO_CURRENT_TIME_FACTORY`

---

### Task 3: Update MapLocationComponent tests

**Objective:** The tests currently provide `TERMO_CURRENT_TIME_FACTORY` with a mock factory. Replace that pattern with `vi.useFakeTimers()` and `vi.setSystemTime()` to control `new Date()` globally. The DOM assertions should remain unchanged since the template output is identical.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.spec.ts`

**What to do:**

- Remove the import of `TERMO_CURRENT_TIME_FACTORY`
- Remove the `MOCK_NOW` constant if it's used only for the token (it may still be useful for `vi.setSystemTime`)
- Add `vi.useFakeTimers()` and `vi.setSystemTime(MOCK_NOW)` in a `beforeEach` block
- Add `vi.useRealTimers()` in an `afterEach` block
- Remove the `{ provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => MOCK_NOW }` provider from `TestBed.configureTestingModule`
- The pipe-stub approach via `TestBed.overrideComponent` already replaces `IsLocationOutdatedPipe` and `RelativeTimePipe` with `ToFixedPipe` — just remove them from the override's imports array
- The DOM assertions for outdated warning visibility and relative time text content should pass without changes since the computed signals produce the same output
- The test at the end (line 60 in the original) that asserts the factory was called twice should be removed — that was pipe-specific behaviour and no longer applies
- The `afterEach` with `vi.restoreAllMocks()` should be kept or adjusted to work with fake timer cleanup

**Verification:** Run the component spec — all tests pass. Run the full suite — no regressions.

**Commit message:** `test: update MapLocationComponent tests for signal-based time`

---

## Summary of changes

| Action | File |
|--------|------|
| Modify | `src/app/components/map-location/map-location.component.ts` |
| Modify | `src/app/components/map-location/map-location.component.html` |
| Modify | `src/app/components/map-location/map-location.component.spec.ts` |
| Modify | `src/main.ts` |
| Delete | `src/app/pipes/relative-time.pipe.ts` |
| Delete | `src/app/pipes/relative-time.pipe.spec.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.spec.ts` |
| Delete | `src/app/pipes/current-time.injection-token.ts` |

## Verification sequence

After all tasks:
1. `npm run lint` — no lint errors
2. `npm test` — all tests pass
3. `npm run build` — production build succeeds

## Design decisions and trade-offs

**Why 60-second tick instead of the old `pure: false` approach:** The old impure pipe re-evaluated on every change detection cycle, which in a zoneless app is unpredictable. A 60-second signal tick guarantees regular re-evaluation regardless of other CD triggers. For time display at "X min." / "X godz." resolution, 60 seconds is sufficient — the display won't noticeably lag.

**Why inline the logic instead of extracting pure functions:** Only one component uses this logic. The formatting is ~10 lines of `date-fns` calls in a `computed()`. Extracting to a utility file would add indirection without a second consumer. YAGNI — extract when another component needs it.

**Why no dedicated `ClockService`:** A service introduces indirection, a separate file, and DI ceremony for what is essentially a `setInterval` and a `signal`. The component is the only clock consumer. If another component later needs `now`, extract then (Card 5 in the architecture review already suggests that `MapBackgroundService` could absorb background dimention-fetching too).

**Why delete the injection token instead of repurposing it:** The token existed solely to make the impure pipes testable by injecting a mock `() => Date`. With signals, the test surface shifts to `vi.setSystemTime()` which is simpler and more aligned with how the component actually works (it calls `new Date()`, not a DI factory). Keeping the token would add a provider without a consumer.
