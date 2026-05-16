import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { Scheduler } from '@granito/vitest-marbles';

import { MapFacade } from './map.facade';
import { MapInitialized, SelectLocation } from '../../state/location/location.actions';
import * as selectors from '../../state/selectors';
import { MapBackgroundService } from '../../services/map-background.service';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { environment } from 'environments/environment';
import { Location } from '../../state/location/location.model';
import { Measurement } from '../../state/measurement/measurement.model';

const makeMeasurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  id: 'meas-1',
  value: 25,
  created_at: new Date(),
  feed_id: 1,
  feed_key: 'loc-test',
  ...overrides,
});

describe('MapFacade', () => {
  let facade: MapFacade;
  let store: MockStore;
  let mapBackgroundServiceMock: { getImageDimentions: ReturnType<typeof vi.fn> };
  let errorHandlingServiceMock: { handle: ReturnType<typeof vi.fn> };
  let testLocation: Location;

  beforeEach(() => {
    vi.restoreAllMocks();
    Scheduler.init();

    mapBackgroundServiceMock = {
      getImageDimentions: vi.fn(),
    };
    errorHandlingServiceMock = {
      handle: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MapFacade,
        provideMockStore(),
        { provide: MapBackgroundService, useValue: mapBackgroundServiceMock },
        { provide: ErrorHandlingService, useValue: errorHandlingServiceMock },
      ],
    });

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'select');
    facade = TestBed.inject(MapFacade);

    testLocation = {
      id: 'loc-test',
      name: 'Test Location',
      mapPosition: { x: 10, y: 20 },
      updatedAt: new Date(),
    };
  });

  it('creates an instance', () => {
    expect(facade).toBeTruthy();
  });

  describe('observable selectors', () => {
    it('loading$ is wired to selectLocationLoading', () => {
      expect(store.select).toHaveBeenCalledWith(selectors.selectLocationLoading);
    });

    it('locations$ is wired to selectLocationsMappedWithKeyMeasurementValues', () => {
      expect(store.select).toHaveBeenCalledWith(
        selectors.selectLocationsMappedWithKeyMeasurementValues,
      );
    });

    it('selectedLocation$ is wired to selectSelectedLocation', () => {
      expect(store.select).toHaveBeenCalledWith(selectors.selectSelectedLocation);
    });

    it('measurementsByLocation$ is wired to selectMeasurementsByLocation', () => {
      expect(store.select).toHaveBeenCalledWith(selectors.selectMeasurementsByLocation);
    });
  });

  describe('dispatchMapInit', () => {
    it('dispatches MapInitialized action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.dispatchMapInit();
      expect(dispatchSpy).toHaveBeenCalledWith(new MapInitialized());
    });
  });

  describe('getImageDimentions', () => {
    it('delegates to MapBackgroundService.getImageDimentions with environment.mapBackgroundUrl and returns the result', () => {
      const mockDimensions = { width: 800, height: 600 };
      const mockResult$ = of(mockDimensions);
      mapBackgroundServiceMock.getImageDimentions.mockReturnValue(mockResult$);

      const result = facade.getImageDimentions();

      expect(mapBackgroundServiceMock.getImageDimentions).toHaveBeenCalledOnce();
      expect(mapBackgroundServiceMock.getImageDimentions).toHaveBeenCalledWith(
        environment.mapBackgroundUrl,
      );
      expect(result).toBe(mockResult$);
    });
  });

  describe('selectLocation', () => {
    it('dispatches SelectLocation when measurements array has items', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const measurementsByLocation = { 'loc-test': [makeMeasurement()] };
      store.overrideSelector(selectors.selectMeasurementsByLocation, measurementsByLocation);

      const stream$ = facade.selectLocation(testLocation);

      expect(stream$).toSatisfyOnFlush(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          new SelectLocation({ location: testLocation }),
        );
        expect(errorHandlingServiceMock.handle).not.toHaveBeenCalled();
      });
    });

    it('calls error handler and does NOT dispatch when measurements array is empty', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const measurementsByLocation: Record<string, Measurement[]> = {
        'loc-test': [],
      };
      store.overrideSelector(selectors.selectMeasurementsByLocation, measurementsByLocation);

      const stream$ = facade.selectLocation(testLocation);

      expect(stream$).toSatisfyOnFlush(() => {
        expect(errorHandlingServiceMock.handle).toHaveBeenCalledWith(
          new Error('Brak aktualnych danych do wyświetlenia na wykresie.'),
        );
        expect(dispatchSpy).not.toHaveBeenCalledWith(
          new SelectLocation({ location: testLocation }),
        );
      });
    });

    it('dispatches SelectLocation when measurements key does not exist for the location', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const measurementsByLocation: Record<string, Measurement[]> = {};
      store.overrideSelector(selectors.selectMeasurementsByLocation, measurementsByLocation);

      const stream$ = facade.selectLocation(testLocation);

      expect(stream$).toSatisfyOnFlush(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          new SelectLocation({ location: testLocation }),
        );
        expect(errorHandlingServiceMock.handle).not.toHaveBeenCalled();
      });
    });
  });
});
