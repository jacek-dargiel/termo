# Testing Conventions

## Test Framework
Vitest via `@angular/build:unit-test`. All test files use `*.spec.ts` (not `*.jest-spec.ts`, which are legacy migration references).

## Imports
Always import vitest globals explicitly:
```ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
```

## Lifecycle Hooks

### `vi.restoreAllMocks()` — in `afterEach`
```ts
afterEach(() => {
  vi.restoreAllMocks();
});
```
**Exception — specs using `.toSatisfyOnFlush()`:** The marble module-level `afterEach` flushes the scheduler and runs deferred `.toSatisfyOnFlush()` callbacks. If `vi.restoreAllMocks()` runs in the spec's `afterEach`, it executes *before* those deferred callbacks, clearing spies before they can be checked. For these specs, place `vi.restoreAllMocks()` in `beforeEach` instead:
```ts
beforeEach(() => {
  Scheduler.init();
  vi.restoreAllMocks();
});
```
Must **not** restore global mocks (e.g. `globalThis.Image`) in `afterEach` — the `@granito/vitest-marbles` module-level `afterEach` runs last and may need those mocks alive.

### `Scheduler.init()` — in `beforeEach` for marble specs
Every spec that uses `@granito/vitest-marbles` (`cold`, `hot`, `schedule`, `.toBeObservable()`, `.toSatisfyOnFlush()`) must call `Scheduler.init()` in `beforeEach`:
```ts
beforeEach(() => {
  Scheduler.init();
});
```

## TestBed Patterns

### Component tests
- Must include `provideZonelessChangeDetection()` in providers.
- Use a `setup()` function that returns fixtures and mocks.

```ts
describe('MapComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MapFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(MapComponent, {
      set: { imports: [ChildStub, AsyncPipe] },
    });

    const fixture = TestBed.createComponent(MapComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, ...otherMocks };
  }

  it('...', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

### Standalone child stubs
Do **not** add `standalone: true` — it is the default in Angular v21. Wire stubs via `TestBed.overrideComponent({ set: { imports: [...] } })`.

```ts
@Component({ selector: 'termo-spinner', template: '' })
class StubSpinnerComponent {}
```

### HttpClient tests
Use `provideHttpClient()` + `provideHttpClientTesting()`:
```ts
TestBed.configureTestingModule({
  providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
});
```
Call `httpTesting.verify()` in `afterEach` (after `vi.restoreAllMocks()`).

### Services without `providedIn`
Must be listed explicitly in providers (e.g. `LocationService`).

## Pipe Testing
- **Pipes without DI**: `new ThePipe()` directly, no TestBed.
- **Pipes using `inject()`**: `TestBed.runInInjectionContext(() => new ThePipe())`.

## NgRx Conventions
- Actions are class-based: `new ActionClass(payload)`, not `createAction`.
- Reducer state exports: `INITIAL_STATE` (uppercase, `location.reducer.ts`) vs `initialState` (lowercase, `measurment.reducer.ts`) — match the source.
- Facades: spy on `store.select` for wiring tests; spy on `store.dispatch` for dispatch tests.

```ts
vi.spyOn(store, 'select');
const facade = TestBed.inject(HeaderFacade);
expect(store.select).toHaveBeenCalledWith(selectMeasurmentsLoading);
```

## Marble Testing
Use `@granito/vitest-marbles`:
- `cold` / `hot` for observable definitions.
- `schedule()` for pushing values into live subjects mid-marble.
- `expect(obs$).toBeObservable(expected)` for value-equality over time.
- `expect(obs$).toSatisfyOnFlush(() => { ... })` for side-effect assertions.

```ts
beforeEach(() => {
  Scheduler.init();
});

it('example', () => {
  const source$ = cold('-a|', { a: 1 });
  const expected$ = cold('-a|', { a: 1 });
  expect(source$).toBeObservable(expected$);
});
```

## Test Data Factories
Prefer factory functions for test data:
```ts
function createLocation(overrides?: Partial<Location>): Location {
  return { id: 'loc-1', name: 'Default', mapPosition: { x: 0, y: 0 }, updatedAt: new Date(), ...overrides };
}
```

## Time
- Use `date-fns` (`subHours`, `subMilliseconds`, etc.) for date math rather than raw milliseconds.
- Use `vi.useFakeTimers()` / `vi.setSystemTime()` / `vi.useRealTimers()` for time-dependent tests.
- Hardcode threshold values as raw numbers (e.g. `900_000`) instead of importing environment modules.

## Describe Nesting
Top-level `describe` names the unit under test. Nested `describe` blocks name methods or feature areas. Do not add banner/separator comments above describe blocks.

## `TestBed.resetTestingModule()`
Do **not** call `TestBed.resetTestingModule()`. Vitest isolates tests by default, and it adds unnecessary noise.
