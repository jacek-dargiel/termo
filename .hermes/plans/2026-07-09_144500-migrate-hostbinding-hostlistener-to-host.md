# `@HostBinding`/`@HostListener` → `host` Property Migration Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace all `@HostBinding` and `@HostListener` decorators with the `host` property inside `@Component` decorators across the codebase, then enable host binding type checking.

**Architecture:** Direct find-and-replace migration. Each `@HostBinding` becomes a key in the `host: { ... }` object using the same binding syntax as templates (`[class.name]`, `[style.prop.%]`, `(event)`). The `@HostListener` becomes an event handler expression. No runtime behavior changes — same classes, styles, and event handlers, just declared declaratively.

**Tech Stack:** Angular 20+, zoneless, standalone components

**Current usages:**
| File | Decorator | Expression |
|------|-----------|------------|
| `src/app/components/map-location/map-location.component.ts` | `@HostBinding('class.location--selected')` | on `selected` |
| `src/app/components/map-location/map-location.component.ts` | `@HostBinding('style.bottom.%')` | on `bottom` |
| `src/app/components/map-location/map-location.component.ts` | `@HostBinding('style.right.%')` | on `right` |
| `src/app/components/map-location/map-location.component.ts` | `@HostListener('click')` | on `selectLocationEntities()` |
| `src/app/containers/chart/chart.component.ts` | `@HostBinding('class.chart--visible')` | on `visible` getter |

**Validation:** `npm run build` and `npm test` must pass after migration.

---

### Task 1: Migrate `map-location.component.ts`

**Objective:** Replace 4 decorators (3x `@HostBinding`, 1x `@HostListener`) with `host` property. Remove unused imports.

**Files:**
- Modify: `src/app/components/map-location/map-location.component.ts`

**Changes:**

1. Add `host` property to `@Component` decorator:

```typescript
@Component({
    selector: 'termo-map-location',
    templateUrl: './map-location.component.html',
    styleUrls: ['./map-location.component.scss'],
    imports: [SpinnerComponent, IsLocationOutdatedPipe, RelativeTimePipe, ToFixedPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.location--selected]': 'selected',
        '[style.bottom.%]': 'bottom',
        '[style.right.%]': 'right',
        '(click)': 'selectLocationEntities()',
    },
})
```

2. Remove `@HostBinding` and `@HostListener` decorators from the class members:
   - Remove `@HostBinding('class.location--selected')` from `selected`
   - Remove `@HostBinding('style.bottom.%')` from `bottom`
   - Remove `@HostBinding('style.right.%')` from `right`
   - Remove `@HostListener('click')` from `selectLocationEntities()`

3. Remove `HostBinding`, `HostListener` from the Angular imports (line 1). The import line becomes:
```typescript
import { Component, Input, OnInit, input, output, ChangeDetectionStrategy } from '@angular/core';
```

**Step 1: Edit the file**

Apply all changes above to `map-location.component.ts`.

**Step 2: Verify the build**

Run: `npm run build` — expected: BUILD SUCCESS

**Step 3: Verify tests**

Run: `npm test` — expected: all tests pass

**Step 4: Commit**

```bash
git add src/app/components/map-location/map-location.component.ts
git commit -m "refactor: replace @HostBinding/@HostListener with host property in MapLocationComponent"
```

---

### Task 2: Migrate `chart.component.ts`

**Objective:** Replace 1 `@HostBinding` decorator with `host` property. Remove the now-unused `visible` getter and unused imports.

**Files:**
- Modify: `src/app/containers/chart/chart.component.ts`

**Changes:**

1. Add `host` property to `@Component` decorator:

```typescript
@Component({
  selector: 'termo-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  imports: [LineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.chart--visible]': 'selectedLocation() !== null',
  },
})
```

2. Remove the `@HostBinding('class.chart--visible')` decorator and the `visible` getter (lines 21-24). The `visible` getter is not used in the template or anywhere else — only existed for the `@HostBinding`.

3. Remove `HostBinding` from Angular imports (line 1). The import line becomes:
```typescript
import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
```

**Step 1: Edit the file**

Apply all changes above to `chart.component.ts`.

**Step 2: Verify the build**

Run: `npm run build` — expected: BUILD SUCCESS

**Step 3: Verify tests**

Run: `npm test` — expected: all tests pass

**Step 4: Commit**

```bash
git add src/app/containers/chart/chart.component.ts
git commit -m "refactor: replace @HostBinding with host property in ChartComponent"
```

---

### Task 3: Enable host binding type checking (verify/enable)

**Objective:** Ensure `typeCheckHostBindings` is enabled in `angularCompilerOptions`.

**Background:** Angular 20+ defaults `typeCheckHostBindings` to `true`. The project's `tsconfig.app.json` already has `strictTemplates: true` and doesn't set `typeCheckHostBindings` to `false`, so it's **already enabled by default**. No explicit config change is needed.

**Verification:**
- Run: `npm run build` — if the build passes, host binding type checking is active and the new `host` expressions are correctly typed.
- If any type errors surface (unlikely given the simple expressions), fix them.

**Note:** This task is essentially a verification step — confirm the compiler catches type issues in the new `host` bindings.

---

### Risks, Tradeoffs, and Open Questions

- **`@Input()` on `selected`:** The `selected` property still uses `@Input()` (not the signal `input()`). The TODO doesn't ask to migrate it, and mixing `@Input()` with host bindings works fine. Migrating `@Input()` to `input()` is a separate task.
- **`bottom`/`right` reactivity:** These are plain properties set once in `ngOnInit`. The host binding reads them during change detection, so values are correct. If dynamic repositioning is needed later, migration to signals would be required — out of scope here.
- **`MapLocationComponent` still implements `OnInit`:** The `ngOnInit` lifecycle is still needed to call `adjustPosition()` which sets `bottom` and `right`. This is unchanged.
- **`typeCheckHostBindings`:** Since the Angular 20+ default is `true`, this is already active. No tsconfig change needed.
