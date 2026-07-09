# Issue #52: Replace impure RelativeTimePipe with `computed()` in consuming component

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Eliminate `pure: false` pipes (`RelativeTimePipe`, `IsLocationOutdatedPipe`) in favor of `computed()` signals in `MapLocationComponent`, driven by a `ClockService` that provides a ticking `now` signal. Remove the `TERMO_CURRENT_TIME_FACTORY` injection token.

**Architecture:** Extract pure utility functions for time formatting logic (testable without Angular DI). Create a minimal `ClockService` that exposes `now: Signal<Date>` refreshed via `setInterval(…, 60_000)`. `MapLocationComponent` uses `computed()` to derive `relativeTime` and `isOutdated` signals from `location().updatedAt` and the clock's `now`. Both pipes and their injection token are deleted.

**Tech Stack:** Angular 22, signals, zoneless change detection, date-fns, Vitest.

---

## Tasks

### Task 1: Extract pure utility functions for time operations

**Objective:** Move the formatting/checking logic out of Angular pipes into testable pure functions. The existing pipe tests that verify correct output against known `(value, now)` pairs can be preserved with minimal changes.

**Files:**
- Create: `src/app/utils/time-utils.ts`
- Create: `src/app/utils/time-utils.spec.ts`
- Delete: `src/app/pipes/relative-time.pipe.spec.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.spec.ts`

**Step 1: Write the utility functions**

```typescript
// src/app/utils/time-utils.ts
import { isBefore, subDays, subHours, differenceInCalendarDays, differenceInHours, differenceInMinutes, subMilliseconds } from 'date-fns';

export function formatRelativeTime(value: Date, now: Date): string {
  if (isBefore(value, subDays(now, 2))) {
    const days = differenceInCalendarDays(now, value);
    return `${days} dni`;
  }
  if (isBefore(value, subHours(now, 2))) {
    const hours = differenceInHours(now, value);
    return `${hours} godz.`;
  }
  const minutes = differenceInMinutes(now, value);
  return `${minutes} min.`;
}

export function isLocationOutdated(value: Date, now: Date, thresholdMs: number): boolean {
  const thresholdDate = subMilliseconds(now, thresholdMs);
  return isBefore(value, thresholdDate);
}
```

**Step 2: Write tests for the utility functions**

```typescript
// src/app/utils/time-utils.spec.ts
import { describe, expect, it } from 'vitest';
import { subMilliseconds } from 'date-fns';
import { environment } from 'environments/environment';
import { formatRelativeTime, isLocationOutdated } from './time-utils';

const NOW = new Date('2024-01-10T12:00:00.000Z');

describe('formatRelativeTime', () => {

  it('returns days for values older than two days', () => {
    const result = formatRelativeTime(new Date('2024-01-08T11:59:59.000Z'), NOW);
    expect(result).toBe('2 dni');
  });

  it('returns hours at the strict two-day boundary', () => {
    const result = formatRelativeTime(new Date('2024-01-08T12:00:00.000Z'), NOW);
    expect(result).toBe('48 godz.');
  });

  it('returns minutes for a value exactly two hours old', () => {
    const result = formatRelativeTime(new Date('2024-01-10T10:00:00.000Z'), NOW);
    expect(result).toBe('120 min.');
  });

  it('returns minutes for recent values', () => {
    const result = formatRelativeTime(new Date('2024-01-10T11:59:00.000Z'), NOW);
    expect(result).toBe('1 min.');
  });

  it('returns negative minutes for future values', () => {
    const result = formatRelativeTime(new Date('2024-01-10T12:01:00.000Z'), NOW);
    expect(result).toBe('-1 min.');
  });

  it('does not depend on mutable state — same inputs always same output', () => {
    const input = new Date('2024-01-10T11:00:00.000Z');
    expect(formatRelativeTime(input, NOW)).toBe('60 min.');
    // Later "now" produces different output because it's a different input
    const laterNow = new Date('2024-01-10T14:30:00.000Z');
    expect(formatRelativeTime(input, laterNow)).toBe('3 godz.');
  });
});

describe('isLocationOutdated', () => {
  const THRESHOLD_MS = 900_000; // 15 min

  it('returns true when value is older than the threshold', () => {
    const thresholdDate = subMilliseconds(NOW, THRESHOLD_MS);
    const olderDate = subMilliseconds(thresholdDate, 1);
    expect(isLocationOutdated(olderDate, NOW, THRESHOLD_MS)).toBe(true);
  });

  it('returns false when value is more recent than the threshold', () => {
    const thresholdDate = subMilliseconds(NOW, THRESHOLD_MS);
    const newerDate = new Date(thresholdDate.getTime() + 1);
    expect(isLocationOutdated(newerDate, NOW, THRESHOLD_MS)).toBe(false);
  });

  it('returns false when value equals the threshold boundary', () => {
    const thresholdDate = subMilliseconds(NOW, THRESHOLD_MS);
    expect(isLocationOutdated(thresholdDate, NOW, THRESHOLD_MS)).toBe(false);
  });
});
```

**Step 3: Run the new tests to verify they pass**

Run: `npx ng test --include src/app/utils/time-utils.spec.ts` or `npm run test:file -- src/app/utils/time-utils.spec.ts`
Expected: ALL PASS (pure functions with no dependencies)

**Step 4: Delete old pipe spec files**

Delete `src/app/pipes/relative-time.pipe.spec.ts` and `src/app/pipes/is-location-outdated.pipe.spec.ts` since their behavior is now tested by `time-utils.spec.ts`.

**Step 5: Commit**

```bash
git add src/app/utils/time-utils.ts src/app/utils/time-utils.spec.ts
git rm src/app/pipes/relative-time.pipe.spec.ts src/app/pipes/is-location-outdated.pipe.spec.ts
git commit -m "refactor: extract pure time utility functions from pipes"
```

---

### Task 2: Create ClockService

**Objective:** Provide a signal-based `now` that ticks every 60 seconds. Replaces `TERMO_CURRENT_TIME_FACTORY` injection token as the "current time" source.

**Files:**
- Create: `src/app/services/clock.service.ts`
- Create: `src/app/services/clock.service.spec.ts`

**Step 1: Write the ClockService**

```typescript
// src/app/services/clock.service.ts
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly destroyRef = inject(DestroyRef);

  /** A signal that updates every 60 seconds. */
  readonly now = signal(new Date());

  constructor() {
    const intervalId = setInterval(() => this.now.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }
}
```

Design notes:
- `providedIn: 'root'` — single app-wide instance, no extra provider needed
- `setInterval` every 60s — matches resolution of "X min." / "X godz." display
- Cleanup via `DestroyRef` — no memory leaks
- Signal-based: consumers use `computed()` and get automatic zoneless CD updates

**Step 2: Write ClockService tests**

```typescript
// src/app/services/clock.service.spec.ts
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { ClockService } from './clock.service';

describe('ClockService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates an instance', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const service = TestBed.inject(ClockService);
    expect(service).toBeTruthy();
  });

  it('initializes now with the current time', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const service = TestBed.inject(ClockService);
    expect(service.now().toISOString()).toBe('2024-01-10T12:00:00.000Z');
  });

  it('updates now after 60 seconds', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const service = TestBed.inject(ClockService);

    vi.advanceTimersByTime(60_000);

    expect(service.now().toISOString()).toBe('2024-01-10T12:01:00.000Z');
  });

  it('does not update now before 60 seconds', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const service = TestBed.inject(ClockService);

    vi.advanceTimersByTime(59_999);

    expect(service.now().toISOString()).toBe('2024-01-10T12:00:00.000Z');
  });
});
```

Note: Tests use `vi.useFakeTimers()` and `provideZonelessChangeDetection()` as required by the codebase's zoneless setup (per AGENTS.md).

**Step 3: Run ClockService tests**

Run: `npm run test:file -- src/app/services/clock.service.spec.ts`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/app/services/clock.service.ts src/app/services/clock.service.spec.ts
git commit -m "feat: add ClockService with signal-based now() ticking every 60s"
```

---

### Task 3: Update MapLocationComponent to use computed()

**Objective:** Replace the impure pipes (`RelativeTimePipe`, `IsLocationOutdatedPipe`) in `MapLocationComponent` with `computed()` signals that derive from `location().updatedAt` and `ClockService.now()`. Remove pipe imports from the component.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.ts`
- Modify: `src/app/components/map-location/map-location.component.html`

**Step 1: Review current state**

Current `map-location.component.ts`:
```typescript
import { Component, Input, OnInit, input, output, ChangeDetectionStrategy } from '@angular/core';
import { LocationWithKeyMeasurementValues, Location } from '../../interfaces';
import { SpinnerComponent } from '../spinner/spinner.component';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
// ... component decorator with:
// imports: [SpinnerComponent, IsLocationOutdatedPipe, RelativeTimePipe, ToFixedPipe],
```

Current template has:
```html
@if (location().updatedAt | isLocationOutdated) { ... {{ location().updatedAt | relativeTime }} }
```

**Step 2: Update component class**

```typescript
import { Component, Input, OnInit, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { LocationWithKeyMeasurementValues, Location } from '../../interfaces';
import { environment } from 'environments/environment';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
import { ClockService } from '../../services/clock.service';
import { formatRelativeTime, isLocationOutdated } from '../../utils/time-utils';

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

  private readonly clockService = inject(ClockService);

  readonly relativeTime = computed(() =>
    formatRelativeTime(this.location().updatedAt, this.clockService.now())
  );
  readonly isOutdated = computed(() =>
    isLocationOutdated(this.location().updatedAt, this.clockService.now(), environment.locationOutdatedThreshold)
  );

  constructor(
  ) { }

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

**Step 3: Update template**

Replace the two pipe usages with signal bindings:

```diff
- @if (location().updatedAt | isLocationOutdated) {
+ @if (isOutdated()) {
      <div class="footer footer--warning footer--warning-outdated">
-         <span data-testid="location-outdated">Opóźnione: {{ location().updatedAt | relativeTime }}</span>
+         <span data-testid="location-outdated">Opóźnione: {{ relativeTime() }}</span>
      </div>
  }
```

**Step 4: Update component tests to provide ClockService**

In `map-location.component.spec.ts`, replace the `TERMO_CURRENT_TIME_FACTORY` provider with `ClockService`:

```diff
- import { TERMO_CURRENT_TIME_FACTORY } from '../../pipes/current-time.injection-token';
+ import { ClockService } from '../../services/clock.service';

// in providers:
- { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => MOCK_NOW },
+ ClockService,
```

But the component tests use a fixed `MOCK_NOW` for predictable assertions. The `ClockService` uses `new Date()` which would be the test runtime. We need to either:

**Option A (preferred):** Override `ClockService` with a test double:
```typescript
const mockClock = { now: signal(MOCK_NOW) };
// in providers:
{ provide: ClockService, useValue: mockClock },
```

**Option B:** Use `vi.setSystemTime(MOCK_NOW)` before creating the component and advance time as needed.

The test currently asserts on the relative text output and on `isLocationOutdated` detection. With computed signals, we can control `mockClock.now` to drive different states.

**Step 5: Run all related tests**

Run: `npm run test:file -- src/app/components/map-location/map-location.component.spec.ts`
Expected: ALL PASS

Run full test suite: `npm test`
Expected: All tests pass (no regressions from removed pipes)

**Step 6: Commit**

```bash
git add src/app/components/map-location/map-location.component.ts
git add src/app/components/map-location/map-location.component.html
git add src/app/components/map-location/map-location.component.spec.ts
git commit -m "refactor: replace impure time pipes with computed() signals in MapLocationComponent"
```

---

### Task 4: Remove old pipes and injection token

**Objective:** Clean up the now-unused `RelativeTimePipe`, `IsLocationOutdatedPipe`, and `TERMO_CURRENT_TIME_FACTORY` injection token. Remove their providers from `main.ts`.

**Files:**
- Delete: `src/app/pipes/relative-time.pipe.ts`
- Delete: `src/app/pipes/is-location-outdated.pipe.ts`
- Delete: `src/app/pipes/current-time.injection-token.ts`
- Modify: `src/main.ts`

**Step 1: Verify nothing else imports these files**

Run a grep to confirm nothing imports the deleted files:
```
grep -r "relative-time.pipe\|is-location-outdated.pipe\|current-time.injection-token" src/ --include="*.ts"
```
Expected: only hits in the pipe files themselves (which we're deleting) and in map-location.component files (which we already updated in Task 3).

**Step 2: Remove the provider from main.ts**

In `src/main.ts`, remove:
```typescript
import { TERMO_CURRENT_TIME_FACTORY } from './app/pipes/current-time.injection-token';
// and the provider:
{ provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() },
```

**Step 3: Delete the files**

```bash
git rm src/app/pipes/relative-time.pipe.ts
git rm src/app/pipes/is-location-outdated.pipe.ts
git rm src/app/pipes/current-time.injection-token.ts
```

**Step 4: Run full test suite**

Run: `npm test`
Expected: ALL PASS (no more references to deleted files)

**Step 5: Run lint**

Run: `npm run lint`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/main.ts
git rm src/app/pipes/relative-time.pipe.ts \
      src/app/pipes/is-location-outdated.pipe.ts \
      src/app/pipes/current-time.injection-token.ts
git commit -m "refactor: remove impure time pipes and injection token"
```

---

## Summary of changes

| Action | File |
|--------|------|
| Create | `src/app/utils/time-utils.ts` |
| Create | `src/app/utils/time-utils.spec.ts` |
| Create | `src/app/services/clock.service.ts` |
| Create | `src/app/services/clock.service.spec.ts` |
| Modify | `src/app/components/map-location/map-location.component.ts` |
| Modify | `src/app/components/map-location/map-location.component.html` |
| Modify | `src/app/components/map-location/map-location.component.spec.ts` |
| Modify | `src/main.ts` |
| Delete | `src/app/pipes/relative-time.pipe.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.ts` |
| Delete | `src/app/pipes/current-time.injection-token.ts` |
| Delete | `src/app/pipes/relative-time.pipe.spec.ts` |
| Delete | `src/app/pipes/is-location-outdated.pipe.spec.ts` |

## Risks and open questions

- **Resolution trade-off:** The `ClockService` ticks every 60 seconds. The old `RelativeTimePipe` recalculated on every CD cycle via `pure: false`. For "X min." / "X godz." display, 60s is sufficient — a user won't see "1 min." jump to "2 min." in real-time anyway. If finer granularity is needed later, the interval can be reduced.
- **Import with `@Input` decorated `selected`:** The component still uses `@Input()` for `selected` alongside signal inputs for `location` and `loading`. This is a pre-existing inconsistency (noted in the architecture review) and is out of scope for this issue.
- **Imperative `adjustPosition`:** Still runs in `ngOnInit()` and sets plain class fields — this is also a pre-existing issue (Card 4 in the review) and out of scope.
- **Test override approach:** The component tests use `{ provide: ClockService, useValue: mockClock }` with a signal-based mock. This is consistent with how the existing tests mock `TERMO_CURRENT_TIME_FACTORY`. The `mockClock.now` signal can be `.set()` mid-test to simulate time passing (replacing the old pattern of mutating the factory function's closure variable).
