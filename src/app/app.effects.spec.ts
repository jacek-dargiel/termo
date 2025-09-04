import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, Subject } from 'rxjs';
import { environment } from 'environments/environment';
import * as measurmentActions from './state/measurment/measurment.actions';
import { cold, hot } from 'jest-marbles';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { selectLocationIds } from './state/selectors';

import { AppEffects } from './app.effects';
import * as locationActions from './state/location/location.actions';
import { ErrorHandlingService } from './services/error-handling.service';
import { LocationService } from './services/location.service';
import { MeasurmentService } from './services/measurment.service';
import { RefreshSignalService } from './services/refresh-signal.service';

describe('AppEffects', () => {
	let actions$: Observable<any>;
	let effects: AppEffects;
  let mockErrorHandling: { handle: jest.Mock };
  let mockLocationService: { getLocations: jest.Mock };
	let mockStore: MockStore;

	beforeEach(() => {
		mockErrorHandling = { handle: jest.fn() };
		mockLocationService = { getLocations: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
        provideMockStore({}),
				{ provide: ErrorHandlingService, useValue: mockErrorHandling },
				{ provide: LocationService, useValue: mockLocationService },
        { provide: MeasurmentService, useValue: {} },
        { provide: RefreshSignalService, useValue: { restart: jest.fn(), signal: of(true) } },
      ],
    });

      effects = TestBed.inject(AppEffects);
      mockStore = TestBed.inject(MockStore);
	});

	describe('genericAjaxErrors$', () => {
    it('should call errorHandling.handle when FetchLocationsError action is received', done => {
      const err = new Error('boom');
      const action = new locationActions.FetchLocationsError({ error: err });
      // emit synchronously
      actions$ = of(action);

      // make the mock return a value so the effect will emit and trigger subscription
      mockErrorHandling.handle.mockReturnValue('handled');

      effects.genericAjaxErrors$.subscribe(result => {
        // effect does not dispatch, but maps to errorHandling.handle return value
        expect(mockErrorHandling.handle).toHaveBeenCalledWith(err);
        expect(result).toBe('handled');
        done();
			});
    });
	});

	describe('fetchMeasurmentsErrors$', () => {
		it('should call errorHandling.handle once when multiple errors emitted in throttle window', () => {
			jest.useFakeTimers();
			const err1 = new Error('e1');
			const err2 = new Error('e2');
			const action1 = new measurmentActions.FetchMeasurmentsError({ error: err1, locationId: 'l1' });
			const action2 = new measurmentActions.FetchMeasurmentsError({ error: err2, locationId: 'l2' });

			const actionsSubject = new Subject<any>();
			actions$ = actionsSubject.asObservable();

			// ensure mock returns value so pipeline executes
			mockErrorHandling.handle.mockReturnValue('handled');

			const sub = effects.fetchMeasurmentsErrors$.subscribe();

			actionsSubject.next(action1);
			actionsSubject.next(action2);

			// advance time to pass throttle window
			jest.advanceTimersByTime(environment.snackbarDefaultTimeout + 1);

			expect(mockErrorHandling.handle).toHaveBeenCalledTimes(1);
			expect(mockErrorHandling.handle).toHaveBeenCalledWith(err1);

			// emit after window passed -> should call again
			const err3 = new Error('e3');
			const action3 = new measurmentActions.FetchMeasurmentsError({ error: err3, locationId: 'l3' });
			actionsSubject.next(action3);
			jest.advanceTimersByTime(environment.snackbarDefaultTimeout + 1);

			expect(mockErrorHandling.handle).toHaveBeenCalledTimes(2);
			expect(mockErrorHandling.handle).toHaveBeenCalledWith(err3);

			sub.unsubscribe();
			jest.useRealTimers();
		});
	});


  describe('loadLocations$', () => {
    it('should map MapInitialized -> FetchLocationsSuccess when API returns locations', () => {
      const locations = [ { id: 'l1', name: 'L1', mapPosition: { x: 0, y: 0 }, updatedAt: new Date() } ];
      const action = new locationActions.MapInitialized();
      actions$ = hot('-a', { a: action });

      mockLocationService.getLocations.mockReturnValue(cold('--b|', { b: locations }));

      const expected = cold('---c', { c: new locationActions.FetchLocationsSuccess({ locations }) });

      expect(effects.loadLocations$).toBeObservable(expected);
    });

    it('should map MapInitialized -> FetchLocationsError when API errors', () => {
      const action = new locationActions.MapInitialized();
      actions$ = hot('-a', { a: action });

      const apiError = new Error('network');
      mockLocationService.getLocations.mockReturnValue(cold('--#', {}, apiError));

      const expected = cold('---c', { c: new locationActions.FetchLocationsError({ error: new Error('Nie udało się pobrać listy tuneli.') }) });

      expect(effects.loadLocations$).toBeObservable(expected);
    });
  });

	describe('refreshOnLocationsLoaded$', () => {
		it('should emit RefreshMeasurmentsOnLocationsLoaded for each location in payload', () => {
			const locations = [
				{ id: 'l1', name: 'L1', mapPosition: { x: 0, y: 0 }, updatedAt: new Date() },
				{ id: 'l2', name: 'L2', mapPosition: { x: 1, y: 1 }, updatedAt: new Date() },
			];

			const action = new locationActions.FetchLocationsSuccess({ locations });
			actions$ = hot('-a', { a: action });

			const expectedA = new locationActions.RefreshMeasurmentsOnLocationsLoaded({ locationId: 'l1' });
			const expectedB = new locationActions.RefreshMeasurmentsOnLocationsLoaded({ locationId: 'l2' });

			const expected = cold('-(ab)', { a: expectedA, b: expectedB });

			expect(effects.refreshOnLocationsLoaded$).toBeObservable(expected);
		});
	});

  describe('refreshOnButtonClick$', () => {
		it('should emit RefreshMeasurmentsOnBtnClick for each selected location id', () => {
			// prepare action
			const action = new locationActions.RefreshButtonClick();
			actions$ = hot('-a', { a: action });

			// override selector to return two ids
			mockStore.overrideSelector(selectLocationIds, ['locA', 'locB']);

			const expectedA = new locationActions.RefreshMeasurmentsOnBtnClick({ locationId: 'locA' });
			const expectedB = new locationActions.RefreshMeasurmentsOnBtnClick({ locationId: 'locB' });

			const expected = cold('-(ab)', { a: expectedA, b: expectedB });

			expect(effects.refreshOnButtonClick$).toBeObservable(expected);
		});
	});

  xdescribe('refreshMeasurments$', () => {
		it('should emit FetchMeasurmentsSuccess for each location then RefreshMeasurmentsFinished', () => {
			const action = new locationActions.RefreshButtonClick();
			// actions trigger
			actions$ = hot('-a', { a: action });

      mockStore.overrideSelector(selectLocationIds, ['loc1', 'loc2']);

			const meas1 = [ { id: 'm1', value: 1, created_at: new Date(), feed_id: 1, feed_key: 'loc1' } ];
			const meas2 = [ { id: 'm2', value: 2, created_at: new Date(), feed_id: 2, feed_key: 'loc2' } ];

			// mock measurment.getMeasurments per id
			const mockGet = jest.fn((id: string, start: any) => {
				if (id === 'loc1') return cold('--a|', { a: meas1 });
				if (id === 'loc2') return cold('---b|', { b: meas2 });
				return cold('|');
			});
			TestBed.inject(MeasurmentService).getMeasurments = mockGet;

			const expected1 = new measurmentActions.FetchMeasurmentsSuccess({ measurments: meas1, locationId: 'loc1' });
			const expected2 = new measurmentActions.FetchMeasurmentsSuccess({ measurments: meas2, locationId: 'loc2' });
			const expectedFinished = new locationActions.RefreshMeasurmentsFinished();

			// timings: action at 1, store emits at 3, meas1 emits at 5, meas2 at 6, finished at 7
			const expected = cold('-----a-b-c', { a: expected1, b: expected2, c: expectedFinished });

			expect(effects.refreshMeasurments$).toBeObservable(expected);
		});

		it('should emit FetchMeasurmentsError for failing location and still finish', () => {
			const action = new locationActions.RefreshButtonClick();
			actions$ = hot('-a', { a: action });

      mockStore.overrideSelector(selectLocationIds, ['loc1']);

			const apiErr = new Error('api fail');
			const mockGet = jest.fn(() => cold('--#', {}, apiErr));
			TestBed.inject(MeasurmentService).getMeasurments = mockGet;

			const expectedErrAction = new measurmentActions.FetchMeasurmentsError({ error: new Error('Nie udało się pobrać najnowszych pomiarów temperatury.'), locationId: 'loc1' });
			const expectedFinished = new locationActions.RefreshMeasurmentsFinished();

			// expected timeline: action 1, store 3, error at 5, finished at 6
			const expected = cold('-----a-b', { a: expectedErrAction, b: expectedFinished });

			expect(effects.refreshMeasurments$).toBeObservable(expected);
		});

  });

  describe('resetSignalOnMeasurmentsFinished$', () => {
		it('should call restart on RefreshSignalService when RefreshMeasurmentsFinished is dispatched', () => {
      const action = new locationActions.RefreshMeasurmentsFinished();
      actions$ = hot('-a', { a: action });
      const refreshSignalService = TestBed.inject(RefreshSignalService);

      expect(effects.resetSignalOnMeasurmentsFinished$).toSatisfyOnFlush(() => {
        expect(refreshSignalService.restart).toHaveBeenCalled();
      });

		});

    it('should emit RefreshSignal action', () => {
      const action = new locationActions.RefreshMeasurmentsFinished();
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: new locationActions.RefreshSignal() });
      expect(effects.resetSignalOnMeasurmentsFinished$).toBeObservable(expected);
    });
	});

});
