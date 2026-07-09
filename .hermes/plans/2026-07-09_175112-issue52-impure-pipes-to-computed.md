# Issue #52: Replace impure RelativeTimePipe with `computed()` in component

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Eliminate `pure: false` pipes (`RelativeTimePipe`, `IsLocationOutdatedPipe`) by inlining the clock and formatting logic as signals directly in `MapLocationComponent`. Remove `TERMO_CURRENT_TIME_FACTORY` injection token.

**Architecture:** `MapLocationComponent` owns a `now = signal(new Date())` refreshed via `setInterval(…, 60_000)` in its constructor. Two `computed()` signals — `relativeTime` and `isOutdated` — derive from `location().updatedAt` and `now()`, containing the formatting/checking logic inline. No new services, no utility files. The pipes and their injection token are deleted.

**Tech Stack:** Angular 22, signals, zoneless change detection, date-fns, Vitest.

---

## Tasks

### Task 1: Update MapLocationComponent — add clock and computed signals

**Objective:** Replace pipe imports with a `now` signal and two `computed()` signals. Update the template to use signal bindings instead of pipe transforms.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.ts`
- Modify: `src/app/components/map-location/map-location.component.html`

**Step 1: Update component class**

Current `map-location.component.ts` needs these changes:
- Remove `OnInit` from imports (or keep it — it's still used for `adjustPosition`)
- Add `computed`, `signal`, `DestroyRef`, `inject` imports
- Remove `IsLocationOutdatedPipe` and `RelativeTimePipe` from imports
- Add `environment` import
- Add `ClockService` import → no, skip that. Add `isBefore`, `subDays`, `subHours`, `differenceInCalendarDays`, `differenceInHours`, `differenceInMinutes`, `subMilliseconds` from `date-fns`

Here's the updated component:

```typescript
import { Component, Input, OnInit, input, output, computed, signal, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { isBefore, subDays, subHours, subMilliseconds, differenceInCalendarDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { environment } from 'environments/environment';
import { LocationWithKeyMeasurementValues, Location } from '../../interfaces';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';

@Component({
    selector: 'termo-map-location',
    templateUrl: './map-location.component.html',
    styleUrls: ['./map-location.component.scss'],
    imports: [SpinnerComponent, ToFixedPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.location--selected]': 'selected',
        '[style.bottom.%]': 'bottom',
        '[style.right.%]': 'right',
        '(click)': 'selectLocationEntities()',
    },
})
export class MapLocationComponent implements OnInit {
  readonly location = input.required<LocationWithKeyMeasurementValues>();
  readonly loading = input<boolean>();
  @Input()
  selected!: boolean;
  readonly selectLocation = output<Location>();
  bottom!: number;
  right!: number;

  private readonly destroyRef = inject(DestroyRef);
  private readonly now = signal(new Date());

  readonly relativeTime = computed(() => {
    const value = this.location().updatedAt;
    const current = this.now();
    if (isBefore(value, subDays(current, 2))) {
      return `${differenceInCalendarDays(current, value)} dni`;
    }
    if (isBefore(value, subHours(current, 2))) {
      return `${differenceInHours(current, value)} godz.`;
    }
    return `${differenceInMinutes(current, value)} min.`;
  });

  readonly isOutdated = computed(() => {
    const thresholdDate = subMilliseconds(this.now(), environment.locationOutdatedThreshold);
    return isBefore(this.location().updatedAt, thresholdDate);
  });

  constructor() {
    const intervalId = setInterval(() => this.now.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.right = 100 - (this.location().mapPosition.x * 100);
    this.bottom = 100 - (this.location().mapPosition.y * 100);
  }

  selectLocationEntities() {
    this.selectLocation.emit(this.location());
  }
}
```

Key design decisions:
- `now` is a **private** signal — only used internally by the computed signals; templates don't need it
- `setInterval` lives in the constructor, cleaned up via `DestroyRef` — same lifecycle pattern as `LocationFacade` already uses
- 60-second tick is sufficient for "X min." / "X godz." display granularity
- `relativeTime` and `isOutdated` are **public readonly** — the template binds to them

**Step 2: Update template**

Replace pipe-based bindings with signal calls:

```diff
- @if (location().updatedAt | isLocationOutdated) {
+ @if (isOutdated()) {
      <div class="footer footer--warning footer--warning-outdated">
-         <span data-testid="location-outdated">Opóźnione: {{ location().updatedAt | relativeTime }}</span>
+         <span data-testid="location-outdated">Opóźnione: {{ relativeTime() }}</span>
      </div>
  }
```

**Step 3: Commit**

```bash
git add src/app/components/map-location/map-location.component.ts
git add src/app/components/map-location/map-location.component.html
git commit -m "refactor: replace impure time pipes with computed() in MapLocationComponent"
```

---

### Task 2: Remove old pipes and injection token

**Objective:** Delete `RelativeTimePipe`, `IsLocationOutdatedPipe`, and `TERMO_CURRENT_TIME_FACTORY` from the codebase. Remove their provider from `main.ts`.

**Files:**
- Delete: `src/app/pipes/relative-time.pipe.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.ts`
- Delete: `src/app/pipes/current-time.injection-token.ts`
- Delete: `src/app/pipes/relative-time.pipe.spec.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.spec.ts`
- Modify: `src/main.ts`

**Step 1: Verify nothing else imports these files**

Run: `grep -r "relative-time\|is-location-outdated\|current-time.injection-token" src/ --include="*.ts" | grep -v node_modules`
Expected: no hits (Task 1 removed all remaining imports)

**Step 2: Remove the provider from main.ts**

From `src/main.ts`, remove:
```typescript
import { TERMO_CURRENT_TIME_FACTORY } from './app/pipes/current-time.injection-token';
```
and the corresponding provider:
```typescript
{ provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() },
```

The final providers in `main.ts` should look like:
```typescript
providers: [
    importProvidersFrom(BrowserModule),
    ErrorHandlingService,
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideZonelessChangeDetection(),
    provideHotToastConfig({
      position: 'bottom-center',
      theme: 'snackbar',
      duration: environment.snackbarDefaultTimeout,
    }),
]
```

**Step 3: Delete the files**

```bash
git rm src/app/pipes/relative-time.pipe.ts \
      src/app/pipes/is-location-outdated.pipe.ts \
      src/app/pipes/current-time.injection-token.ts \
      src/app/pipes/relative-time.pipe.spec.ts \
      src/app/pipes/is-location-outdated.pipe.spec.ts
```

**Step 4: Run lint**

Run: `npm run lint`
Expected: PASS — no references to deleted imports

**Step 5: Commit**

```bash
git add src/main.ts
git rm src/app/pipes/relative-time.pipe.ts \
      src/app/pipes/is-location-outdated.pipe.ts \
      src/app/pipes/current-time.injection-token.ts \
      src/app/pipes/relative-time.pipe.spec.ts \
      src/app/pipes/is-location-outdated.pipe.spec.ts
git commit -m "refactor: remove impure time pipes and TERMO_CURRENT_TIME_FACTORY"
```

---

### Task 3: Update MapLocationComponent tests

**Objective:** The component tests currently set up `TERMO_CURRENT_TIME_FACTORY` as a provider and assert against pipe-transformed output. Replace with direct assertions against the computed signals, controlled by advancing fake timers.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.spec.ts`

**Step 1: Rewrite the test setup**

Remove the `TERMO_CURRENT_TIME_FACTORY` provider. The clock is now internal to the component — no injection needed. Use `vi.useFakeTimers()` and `vi.setSystemTime()` to control `now`.

New setup pattern:
```typescript
import { Component, provideZonelessChangeDetection, ChangeDetectionStrategy, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { MapLocationComponent } from './map-location.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
import { LocationWithKeyMeasurementValues } from '../../interfaces';

const MOCK_NOW = new Date('2026-04-25T12:00:00Z');

@Component({
  selector: 'termo-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div data-testid="spinner-stub"></div>',
})
class StubSpinnerComponent {}

function createMockLocation(overrides?: Partial<LocationWithKeyMeasurementValues>): LocationWithKeyMeasurementValues {
  return {
    id: 'loc-1',
    name: 'Living Room',
    mapPosition: { x: 0.5, y: 0.3 },
    updatedAt: new Date('2026-04-25T11:59:00Z'),
    lastMeasurementValue: 22.5,
    minimalMeasurementValue: 18.3,
    ...overrides,
  };
}

describe('MapLocationComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    TestBed.configureTestingModule({
      imports: [MapLocationComponent],
      providers: [
        provideZonelessChangeDetection(),
      ],
    });

    TestBed.overrideComponent(MapLocationComponent, {
      set: { imports: [StubSpinnerComponent, ToFixedPipe] },
    });

    const fixture = TestBed.createComponent(MapLocationComponent);
    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('location', createMockLocation());
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  // ... existing tests remain largely the same, except:
  // - No more TERMO_CURRENT_TIME_FACTORY provider
  // - Tests that checked pipe output now check computed signal output
  // - The "outdated warning" and "relative time" assertions still work
  //   because vi.setSystemTime() controls what new Date() returns
});
```

**Step 2: Update the outdated/relative time test assertions**

The existing tests for outdated detection and relative time used `TERMO_CURRENT_TIME_FACTORY` to return a fixed `MOCK_NOW`. With fake timers, `new Date()` inside the component's constructor and in the `now` signal both return `MOCK_NOW`.

Key test updates:
- **Outdated tests (lines 129-168):** Replace `{ provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => MOCK_NOW }` with `vi.setSystemTime(MOCK_NOW)`. The assertions against `isLocationOutdated` pipe are now assertions against `isOutdated()` computed signal — but since the template already uses the signal, the DOM assertions stay the same.
- **Relative time tests (lines 156-168):** Same pattern — template now calls `relativeTime()` instead of `location().updatedAt | relativeTime`, but the DOM assertions remain unchanged.
- **Remove the test about calling factory twice** (line 60) — that was pipe-specific.
- **The tests for `isOutdated` and relative text content** should still pass since the computed signal produces the same output as the pipe for the same inputs.

**Step 3: Run the updated tests**

Run: `npm run test:file -- src/app/components/map-location/map-location.component.spec.ts`
Expected: ALL PASS

Run full suite: `npm test`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/app/components/map-location/map-location.component.spec.ts
git commit -m "test: update MapLocationComponent tests for signal-based time"
```

---

## Summary of changes

| Action | File |
|--------|------|
| Modify | `src/app/components/map-location/map-location.component.ts` |
| Modify | `src/app/components/map-location/map-location.component.html` |
| Modify | `src/app/components/map-location/map-location.component.spec.ts` |
| Modify | `src/main.ts` |
| Delete | `src/app/pipes/relative-time.pipe.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.ts` |
| Delete | `src/app/pipes/current-time.injection-token.ts` |
| Delete | `src/app/pipes/relative-time.pipe.spec.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.spec.ts` |

## Verification

After all tasks, run:
1. `npm run lint` — no lint errors
2. `npm test` — all tests pass
3. `npm run build` — production build succeeds

## Risks

- **Fake timer interference:** The test already uses `vi.useFakeTimers()` in some tests. The component's `setInterval` in the constructor will fire during test setup. This is fine because `vi.useFakeTimers()` stops real time — the interval callback won't execute until `vi.advanceTimersByTime()` is called. To be safe, create the fixture *after* setting up fake timers (as shown in the test setup above).
- **Current fixture.detectChanges() in existing tests:** Some existing tests call `fixture.detectChanges()` without fake timers. Those tests should continue to work — the `now` signal initialises with `new Date()` (which is `MOCK_NOW` under fake timers), and the computed signals derive from it synchronously. No async gap to worry about.
- **No separate utility file:** The formatting logic is duplicated if another component ever needs relative time. That's YAGNI-compliant — extract when needed. The logic is ~15 lines of `date-fns` calls, and having it inline in a `computed()` makes the component fully self-contained.
