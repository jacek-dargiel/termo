import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { cold, hot, Scheduler } from '@granito/vitest-marbles';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

import { AppEffects } from './app.effects';
import { LocationService } from './services/location.service';
import { MeasurementService } from './services/measurement.service';
import { ErrorHandlingService } from './services/error-handling.service';
import { RefreshSignalService } from './services/refresh-signal.service';
import * as locationActions from './state/location/location.actions';
import * as measurementActions from './state/measurement/measurement.actions';
import * as selectors from './state/selectors';
import { Location } from './state/location/location.model';
import { Measurement } from './state/measurement/measurement.model';

function createLocation(overrides?: Partial<Location>): Location {
  return {
    id: 'loc-1',
    name: 'Location 1',
    mapPosition: { x: 0, y: 0 },
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}

function createMeasurement(overrides?: Partial<Measurement>): Measurement {
  return {
    id: 'meas-1',
    value: 25.5,
    created_at: new Date('2025-01-15T10:00:00Z'),
    feed_id: 1,
    feed_key: 'loc-1',
    ...overrides,
  };
}

describe('AppEffects', () => {
  let actions$: Observable<Action>;
  let effects: AppEffects;
  let store: MockStore;
  let locationService: { getLocations: ReturnType<typeof vi.fn> };
  let measurementService: { getMeasurements: ReturnType<typeof vi.fn> };
  let errorHandlingService: { handle: ReturnType<typeof vi.fn> };
  let refreshSignalService: { restart: ReturnType<typeof vi.fn>; signal: Observable<boolean> };

  beforeEach(() => {
    Scheduler.init();
    vi.restoreAllMocks();

    locationService = { getLocations: vi.fn() };
    measurementService = { getMeasurements: vi.fn() };
    errorHandlingService = { handle: vi.fn() };
    refreshSignalService = {
      restart: vi.fn(),
      signal: of(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            location: { ids: [], entities: {}, loading: false, latestMeasurementIDs: {}, selected: undefined },
            measurement: { ids: [], entities: {}, loading: false },
          },
        }),
        { provide: LocationService, useValue: locationService },
        { provide: MeasurementService, useValue: measurementService },
        { provide: ErrorHandlingService, useValue: errorHandlingService },
        { provide: RefreshSignalService, useValue: refreshSignalService },
      ],
    });

    effects = TestBed.inject(AppEffects);
    store = TestBed.inject(MockStore);
  });

  describe('genericAjaxErrors$', () => {
    it('should call errorHandling.handle with the error from FetchLocationsError', () => {
      const error = new Error('test error');
      actions$ = hot('a|', {
        a: new locationActions.FetchLocationsError({ error }),
      });

      expect(effects.genericAjaxErrors$).toSatisfyOnFlush(() => {
        expect(errorHandlingService.handle).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('fetchMeasurementsErrors$', () => {
    it('should call errorHandling.handle on a single FetchMeasurementsError', () => {
      const error = new Error('measurement error');
      actions$ = hot('a|', {
        a: new measurementActions.FetchMeasurementsError({ error, locationId: 'l1' }),
      });

      expect(effects.fetchMeasurementsErrors$).toSatisfyOnFlush(() => {
        expect(errorHandlingService.handle).toHaveBeenCalledWith(error);
      });
    });

    it('should throttle multiple errors within short time', () => {
      const error1 = new Error('error 1');
      const error2 = new Error('error 2');
      actions$ = hot('a 10ms b', {
        a: new measurementActions.FetchMeasurementsError({ error: error1, locationId: 'l1' }),
        b: new measurementActions.FetchMeasurementsError({ error: error2, locationId: 'l2' }),
      });

      expect(effects.fetchMeasurementsErrors$).toSatisfyOnFlush(() => {
        expect(errorHandlingService.handle).toHaveBeenCalledTimes(1);
        expect(errorHandlingService.handle).toHaveBeenCalledWith(error1);
      });
    });
  });

  describe('loadLocations$', () => {
    it('should fetch locations and dispatch FetchLocationsSuccess', () => {
      const locations: Location[] = [createLocation()];
      locationService.getLocations.mockReturnValue(cold('a|', { a: locations }));

      actions$ = hot('a', { a: new locationActions.MapInitialized() });

      const expected = cold('a', {
        a: new locationActions.FetchLocationsSuccess({ locations }),
      });
      expect(effects.loadLocations$).toBeObservable(expected);
    });

    it('should dispatch FetchLocationsError when service fails', () => {
      locationService.getLocations.mockReturnValue(
        cold('#', undefined, new Error('API down')),
      );

      actions$ = hot('a', { a: new locationActions.MapInitialized() });

      const expected = cold('a', {
        a: new locationActions.FetchLocationsError({
          error: new Error('Nie udało się pobrać listy tuneli.'),
        }),
      });
      expect(effects.loadLocations$).toBeObservable(expected);
    });
  });

  describe('refreshOnLocationsLoaded$', () => {
    it('should dispatch RefreshMeasurementsOnLocationsLoaded for each location', () => {
      const locations: Location[] = [
        createLocation({ id: 'l1' }),
        createLocation({ id: 'l2' }),
      ];

      actions$ = hot('a', {
        a: new locationActions.FetchLocationsSuccess({ locations }),
      });

      const expected = cold('(ab)', {
        a: new locationActions.RefreshMeasurementsOnLocationsLoaded({ locationId: 'l1' }),
        b: new locationActions.RefreshMeasurementsOnLocationsLoaded({ locationId: 'l2' }),
      });
      expect(effects.refreshOnLocationsLoaded$).toBeObservable(expected);
    });

    it('should emit nothing for empty locations array', () => {
      actions$ = hot('a', {
        a: new locationActions.FetchLocationsSuccess({ locations: [] }),
      });

      expect(effects.refreshOnLocationsLoaded$).toBeObservable(cold(''));
    });
  });

  describe('refreshOnButtonClick$', () => {
    it('should select location IDs and dispatch RefreshMeasurementsOnBtnClick for each', () => {
      store.overrideSelector(selectors.selectLocationIds, ['l1', 'l2']);

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      const expected = cold('(ab)', {
        a: new locationActions.RefreshMeasurementsOnBtnClick({ locationId: 'l1' }),
        b: new locationActions.RefreshMeasurementsOnBtnClick({ locationId: 'l2' }),
      });
      expect(effects.refreshOnButtonClick$).toBeObservable(expected);
    });

    it('should emit nothing when no location IDs are in store', () => {
      store.overrideSelector(selectors.selectLocationIds, []);

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      expect(effects.refreshOnButtonClick$).toBeObservable(cold(''));
    });
  });

  describe('refreshMeasurements$', () => {
    it('should call getMeasurements for each location', () => {
      store.overrideSelector(selectors.selectLocationIds, ['l1', 'l2']);

      measurementService.getMeasurements.mockReturnValue(cold('a|', { a: [] }));

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      expect(effects.refreshMeasurements$).toSatisfyOnFlush(() => {
        expect(measurementService.getMeasurements).toHaveBeenCalledTimes(2);
        expect(measurementService.getMeasurements).toHaveBeenCalledWith('l1', expect.any(Date));
        expect(measurementService.getMeasurements).toHaveBeenCalledWith('l2', expect.any(Date));
      });
    });

    it('should dispatch FetchMeasurementsError and RefreshMeasurementsFinished on API error', () => {
      store.overrideSelector(selectors.selectLocationIds, ['l1']);

      measurementService.getMeasurements.mockReturnValue(
        cold('#', undefined, new Error('API down')),
      );

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      const expected = cold('(ab)', {
        a: new measurementActions.FetchMeasurementsError({
          error: new Error('Nie udało się pobrać najnowszych pomiarów temperatury.'),
          locationId: 'l1',
        }),
        b: new locationActions.RefreshMeasurementsFinished(),
      });
      expect(effects.refreshMeasurements$).toBeObservable(expected);
    });

    it('should trigger on FetchLocationsSuccess', () => {
      store.overrideSelector(selectors.selectLocationIds, ['l1']);
      const m: Measurement[] = [createMeasurement()];

      measurementService.getMeasurements.mockReturnValue(cold('--a|', { a: m }));

      actions$ = hot('a', {
        a: new locationActions.FetchLocationsSuccess({ locations: [createLocation()] }),
      });

      const expected = cold('--a(b)', {
        a: new measurementActions.FetchMeasurementsSuccess({ measurements: m, locationId: 'l1' }),
        b: new locationActions.RefreshMeasurementsFinished(),
      });
      expect(effects.refreshMeasurements$).toBeObservable(expected);
    });

    it('should trigger on RefreshSignal', () => {
      store.overrideSelector(selectors.selectLocationIds, ['l1']);
      const m: Measurement[] = [createMeasurement()];

      measurementService.getMeasurements.mockReturnValue(cold('--a|', { a: m }));

      actions$ = hot('a', { a: new locationActions.RefreshSignal() });

      const expected = cold('--a(b)', {
        a: new measurementActions.FetchMeasurementsSuccess({ measurements: m, locationId: 'l1' }),
        b: new locationActions.RefreshMeasurementsFinished(),
      });
      expect(effects.refreshMeasurements$).toBeObservable(expected);
    });
  });

  describe('resetSignalOnMeasurementsFinished$', () => {
    it('should dispatch RefreshSignal when signal emits', () => {
      refreshSignalService.signal = cold('--s--', { s: true });

      actions$ = hot('a', {
        a: new locationActions.RefreshMeasurementsFinished(),
      });

      const expected = cold('--a--', {
        a: new locationActions.RefreshSignal(),
      });
      expect(effects.resetSignalOnMeasurementsFinished$).toBeObservable(expected);
    });

    it('should call refreshSignal.restart', () => {
      refreshSignalService.signal = cold('--s|', { s: true });

      actions$ = hot('a', {
        a: new locationActions.RefreshMeasurementsFinished(),
      });

      expect(effects.resetSignalOnMeasurementsFinished$).toSatisfyOnFlush(() => {
        expect(refreshSignalService.restart).toHaveBeenCalled();
      });
    });
  });
});

afterAll(() => {
  for (const key of Object.keys(selectors)) {
    const value: unknown = (selectors as Record<string, unknown>)[key];
    if (typeof value === 'function') {
      (value as { clearResult?: () => void }).clearResult?.();
      (value as { release?: () => void }).release?.();
    }
  }
});
