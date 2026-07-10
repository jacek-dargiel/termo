# ADR-0002: Use Angular Signals for State Management

**Status:** Accepted
**Date:** 2026-05-17
**Deciders:** jdargiel
**Owner:** jdargiel

## Context

The application currently uses NgRx (`@ngrx/store` + `@ngrx/effects` + `@ngrx/entity`) for client-side state management. The NgRx layer comprises **734 lines across 12 files** (actions, reducers, selectors, effects, facades, reducer index) plus **1,370 lines of tests** across 7 spec files, totaling **~2,100 lines** of state management code.

The application manages only:
- **2 entity types:** locations (4 fields), measurements (5 fields)
- **3 views:** map, chart, header
- **2 API endpoints:** `GET /api/groups/tunele/feeds` (locations), `GET /api/feeds/{feed_key}/data` (measurements)
- **1 auto-refresh loop** for periodic measurement refetch

The NgRx layer has several structural problems:
1. **Bi-directional cross-slice coupling:** `location.reducer.ts` handles `MeasurementActionTypes.FetchMeasurementsSuccess`, and `measurement.reducer.ts` handles `LocationActionTypes.RefreshMeasurementsOnBtnClick` — violating slice isolation.
2. **Empty `State {}` interface** (`state/reducers/index.ts`) used as the store generic everywhere, providing zero type safety at `Store<State>` injection points.
3. **12-dispatcher event chain** for the auto-refresh loop (MapInitialized → loadLocations$ → FetchLocationsSuccess → refreshOnLocationsLoaded$ → RefreshMeasurementsOnLocationsLoaded → … → RefreshMeasurementsFinished → resetSignalOnMeasurementsFinished$ → restart timer → RefreshSignal → back to step 3). This could be a single `setInterval`.
4. **Class-based actions** (pre-`createAction`) with 105 lines of enum + class + union type ceremony producing zero runtime logic.
5. **Selector chain 5 levels deep** (152 lines) for what is essentially "locations with their latest and minimum temperature readings."
6. **Half of all action types** (6 of 12) exist solely to toggle a `loading` boolean.
7. **Three facade files** (91 lines) exist only to bridge components to the store — unnecessary indirection.
8. **NgRx code exceeds non-NgRx application code** — 734 LOC of state management vs ~586 LOC of components, services, pipes, and everything else combined.

The application is already zoneless (`provideZonelessChangeDetection()` in `main.ts`) and runs Angular 21, which has mature, stable signal primitives.

## Decision

We will replace NgRx (`@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`) with **plain Angular services using native `signal()` and `computed()`**. Two `@Injectable({ providedIn: 'root' })` classes will manage location and measurement state respectively, using:

- **`signal<T>()`** for mutable state (entity arrays, loading flags, selected IDs)
- **`computed<T>()`** for derived state (grouped measurements, location+values merges, filtered/sorted projections)
- **`HttpClient` with Observables** for API calls — state services return Observables that set signals in a `finalize`/`tap` pipeline. `httpResource<T>()` remains experimental as of Angular 21 and was not adopted in this migration; it should be revisited when stabilized as it would replace manual loading/error signal management.
- **Direct method calls** instead of action dispatch for user actions (refresh, select location)
- **`setInterval` in an `effect()`** for auto-refresh, replacing the 4-action + 2-effect + `RefreshSignalService` chain

The `@ngrx/store-devtools` package is removed. Angular DevTools provides component tree inspection. State inspection is trivially done via logging signal values in an `effect()`.

## Alternatives Considered

### SignalStore (`@ngrx/signals`)
- **Why considered:** Keeps the NgRx ecosystem, adds structure (withState/withMethods/withComputed/withHooks), integrates with Redux DevTools via `withDevtools()`, and the team already knows NgRx.
- **Why rejected:** Still adds a dependency (`@ngrx/signals`), introduces a proprietary API surface (`signalStore`, `patchState`, `withMethods`) that the team must learn, and the structured approach is still heavier than needed — this app has ~9 state fields total. SignalStore is a good plan B, but for a 2-entity app, two injectable services are sufficient and simpler.

### TanStack Query (`@tanstack/angular-query-experimental`)
- **Why considered:** Purpose-built for API-driven state. `refetchInterval` replaces the entire auto-refresh mechanism. Built-in caching, deduplication, background refetch, and stale-while-revalidate. DevTools for inspecting cache.
- **Why rejected:** Experimental Angular adapter (`-experimental` suffix). Splits mental model into server state (TanStack Query) vs client state (signals) for what is ultimately 2 entity types. Adds dependency on `@tanstack/query-core`. For an app of this scale, the native signals approach achieves the same result without a separate query library.

### Keep NgRx but modernize it
- **Why considered:** Smallest change — switch to `createAction`/`createReducer`/`createActionGroup`, eliminate cross-slice coupling, flatten the selector chain. Estimated ~200 LOC after cleanup vs current ~734.
- **Why rejected:** Still retains the NgRx dependency chain (5 packages, ~4MB on disk), still requires actions/reducers/effects ceremony for what is ultimately CRUD + a timer, and still carries the empty `State {}` interface problem. A full rewrite to signals is proportionally simpler and eliminates all NgRx dependencies at once.

## Consequences

**What gets easier:**
- **~534 lines of production code removed** (actions, reducers, selectors, effects, facades, reducer index, NgRx bootstrapping in `main.ts`). Replaced with ~150–200 lines of signal-based services.
- **~1,170 lines of test code removed** (reducer specs, selector specs, effects specs, facade specs). Replaced with ~200 lines of service unit tests. No more marble testing, no more `provideMockStore`, no more `MockStore`.
- **12 files deleted → 2 files created.** State management lives in `services/location.state.ts` and `services/measurement.state.ts`.
- **5 npm packages removed:** `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`, `@ngrx/store-devtools`, `@ngrx/operators`. ~4MB removed from `node_modules`, ~63KB gzipped removed from production bundle.
- **Readability:** The auto-refresh flow collapses from 12 dispatches + 6 effect reactions to `setInterval(() => this.refreshMeasurements(), refreshTimeout)`.
- **Type safety:** No more `Store<State>` where `State` is an empty `{}` interface. Signals are fully typed with inferred return types.
- **Zoneless alignment:** The app already uses `provideZonelessChangeDetection()`. Signals are zoneless-native — no `AsyncPipe`, no manual `ChangeDetectorRef.markForCheck()` workarounds, no subscription management with `OnDestroy`.
- **No more facade indirection:** Components inject state services directly with `inject(LocationStateService)` instead of going through facade → store dispatch → effect → service.

**What gets harder:**
- **Debugging:** Redux DevTools (time-travel, action log, state diffs) is gone. Debugging involves logging signal values in `effect()` or using Angular DevTools (component tree only). For a 2-entity app with ~9 state fields, the loss is manageable. In practice, Redux DevTools were rarely consulted during development — the debugging need they addressed was largely a symptom of the NgRx architecture's own complexity.
- **Action audit trail:** No structured action history with source tags (`[Map]`, `[API]`, `[Effect]`). Method-call tracing relies on browser DevTools call stacks.
- **Cross-cutting error handling:** The throttled error snackbar (`app.effects.ts` line 50: `throttleTime(snackbarDefaultTimeout)`) originally lived in a single effect. In the signal approach, throttling was moved to an `HttpInterceptor` (see issue #51). The `ErrorHandlingService` now owns the auditTime-throttled toast pipeline, and a functional `httpErrorInterceptor` catches HTTP errors and feeds them through it. Domain errors in state services are caught by facade error callbacks and also routed through `ErrorHandlingService`. This is **implemented** as of 2026-07-10.
- **Immutability enforcement:** NgRx reducers structurally enforce immutability via spread operators. Signal services rely on convention and code review. The risk is low given the small state surface (~9 fields).
- **Timing-based tests:** Marble testing for the auto-refresh timer is replaced by `vi.useFakeTimers()` — simpler but requires different test patterns.

## Re-evaluation Trigger

Reconsider this decision if:
- The application grows to 5+ entity types or requires lazy-loaded state slices
- `httpResource<T>()` stabilizes (exits experimental) — it would replace the manual loading/error signal management currently done via `HttpClient` + Observables
- Angular deprecates `signal()` / `computed()` / `effect()` (unlikely given their foundational role)

## References

- NgRx current footprint: `state/location/` (74 + 126 + 13 lines), `state/measurement/` (31 + 58 + 7 lines), `state/selectors.ts` (152 lines), `app.effects.ts` (117 lines), 3 facades (91 lines), `state/reducers/index.ts` (18 lines)
- Angular Signals guide: https://angular.dev/guide/signals
