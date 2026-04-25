import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { cold, hot, Scheduler } from '@granito/vitest-marbles';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AppEffects } from './app.effects';
import { LocationService } from './services/location.service';
import { MeasurmentService } from './services/measurment.service';
import { ErrorHandlingService } from './services/error-handling.service';
import { RefreshSignalService } from './services/refresh-signal.service';
import * as locationActions from './state/location/location.actions';
import * as measurmentActions from './state/measurment/measurment.actions';
import { selectLocationIds } from './state/selectors';
import { Location } from './state/location/location.model';
import { Measurment } from './state/measurment/measurment.model';

function createLocation(overrides?: Partial<Location>): Location {
  return {
    id: 'loc-1',
    name: 'Location 1',
    mapPosition: { x: 0, y: 0 },
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}

function createMeasurment(overrides?: Partial<Measurment>): Measurment {
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
  let measurmentService: { getMeasurments: ReturnType<typeof vi.fn> };
  let errorHandlingService: { handle: ReturnType<typeof vi.fn> };
  let refreshSignalService: { restart: ReturnType<typeof vi.fn>; signal: Observable<boolean> };

  beforeEach(() => {
    Scheduler.init();

    locationService = { getLocations: vi.fn() };
    measurmentService = { getMeasurments: vi.fn() };
    errorHandlingService = { handle: vi.fn() };
    refreshSignalService = {
      restart: vi.fn(),
      signal: of(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: LocationService, useValue: locationService },
        { provide: MeasurmentService, useValue: measurmentService },
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

  describe('fetchMeasurmentsErrors$', () => {
    it('should call errorHandling.handle on a single FetchMeasurmentsError', () => {
      const error = new Error('measurment error');
      actions$ = hot('a|', {
        a: new measurmentActions.FetchMeasurmentsError({ error, locationId: 'l1' }),
      });

      expect(effects.fetchMeasurmentsErrors$).toSatisfyOnFlush(() => {
        expect(errorHandlingService.handle).toHaveBeenCalledWith(error);
      });
    });

    it('should throttle multiple errors within short time', () => {
      const error1 = new Error('error 1');
      const error2 = new Error('error 2');
      actions$ = hot('a 10ms b', {
        a: new measurmentActions.FetchMeasurmentsError({ error: error1, locationId: 'l1' }),
        b: new measurmentActions.FetchMeasurmentsError({ error: error2, locationId: 'l2' }),
      });

      expect(effects.fetchMeasurmentsErrors$).toSatisfyOnFlush(() => {
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
    it('should dispatch RefreshMeasurmentsOnLocationsLoaded for each location', () => {
      const locations: Location[] = [
        createLocation({ id: 'l1' }),
        createLocation({ id: 'l2' }),
      ];

      actions$ = hot('a', {
        a: new locationActions.FetchLocationsSuccess({ locations }),
      });

      const expected = cold('(ab)', {
        a: new locationActions.RefreshMeasurmentsOnLocationsLoaded({ locationId: 'l1' }),
        b: new locationActions.RefreshMeasurmentsOnLocationsLoaded({ locationId: 'l2' }),
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
    it('should select location IDs and dispatch RefreshMeasurmentsOnBtnClick for each', () => {
      store.overrideSelector(selectLocationIds, ['l1', 'l2']);

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      const expected = cold('(ab)', {
        a: new locationActions.RefreshMeasurmentsOnBtnClick({ locationId: 'l1' }),
        b: new locationActions.RefreshMeasurmentsOnBtnClick({ locationId: 'l2' }),
      });
      expect(effects.refreshOnButtonClick$).toBeObservable(expected);
    });

    it('should emit nothing when no location IDs are in store', () => {
      store.overrideSelector(selectLocationIds, []);

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      expect(effects.refreshOnButtonClick$).toBeObservable(cold(''));
    });
  });

  describe('refreshMeasurments$', () => {
    it('should call getMeasurments for each location', () => {
      store.overrideSelector(selectLocationIds, ['l1', 'l2']);

      measurmentService.getMeasurments.mockReturnValue(cold('a|', { a: [] }));

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      expect(effects.refreshMeasurments$).toSatisfyOnFlush(() => {
        expect(measurmentService.getMeasurments).toHaveBeenCalledTimes(2);
        expect(measurmentService.getMeasurments).toHaveBeenCalledWith('l1', expect.any(Date));
        expect(measurmentService.getMeasurments).toHaveBeenCalledWith('l2', expect.any(Date));
      });
    });

    it('should dispatch FetchMeasurmentsError and RefreshMeasurmentsFinished on API error', () => {
      store.overrideSelector(selectLocationIds, ['l1']);

      measurmentService.getMeasurments.mockReturnValue(
        cold('#', undefined, new Error('API down')),
      );

      actions$ = hot('a', { a: new locationActions.RefreshButtonClick() });

      const expected = cold('(ab)', {
        a: new measurmentActions.FetchMeasurmentsError({
          error: new Error('Nie udało się pobrać najnowszych pomiarów temperatury.'),
          locationId: 'l1',
        }),
        b: new locationActions.RefreshMeasurmentsFinished(),
      });
      expect(effects.refreshMeasurments$).toBeObservable(expected);
    });

    it('should trigger on FetchLocationsSuccess', () => {
      store.overrideSelector(selectLocationIds, ['l1']);
      const m: Measurment[] = [createMeasurment()];

      measurmentService.getMeasurments.mockReturnValue(cold('--a|', { a: m }));

      actions$ = hot('a', {
        a: new locationActions.FetchLocationsSuccess({ locations: [createLocation()] }),
      });

      const expected = cold('--a(b)', {
        a: new measurmentActions.FetchMeasurmentsSuccess({ measurments: m, locationId: 'l1' }),
        b: new locationActions.RefreshMeasurmentsFinished(),
      });
      expect(effects.refreshMeasurments$).toBeObservable(expected);
    });

    it('should trigger on RefreshSignal', () => {
      store.overrideSelector(selectLocationIds, ['l1']);
      const m: Measurment[] = [createMeasurment()];

      measurmentService.getMeasurments.mockReturnValue(cold('--a|', { a: m }));

      actions$ = hot('a', { a: new locationActions.RefreshSignal() });

      const expected = cold('--a(b)', {
        a: new measurmentActions.FetchMeasurmentsSuccess({ measurments: m, locationId: 'l1' }),
        b: new locationActions.RefreshMeasurmentsFinished(),
      });
      expect(effects.refreshMeasurments$).toBeObservable(expected);
    });
  });

  describe('resetSignalOnMeasurmentsFinished$', () => {
    it('should dispatch RefreshSignal when signal emits', () => {
      refreshSignalService.signal = cold('--s--', { s: true });

      actions$ = hot('a', {
        a: new locationActions.RefreshMeasurmentsFinished(),
      });

      const expected = cold('--a--', {
        a: new locationActions.RefreshSignal(),
      });
      expect(effects.resetSignalOnMeasurmentsFinished$).toBeObservable(expected);
    });

    it('should call refreshSignal.restart', () => {
      refreshSignalService.signal = cold('--s|', { s: true });

      actions$ = hot('a', {
        a: new locationActions.RefreshMeasurmentsFinished(),
      });

      expect(effects.resetSignalOnMeasurmentsFinished$).toSatisfyOnFlush(() => {
        expect(refreshSignalService.restart).toHaveBeenCalled();
      });
    });
  });
});
