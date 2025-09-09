import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { cold } from 'jest-marbles';
import { TestScheduler } from 'rxjs/testing';
import { MapFacade } from './map.facade';
import { MapBackgroundService } from '../../services/map-background.service';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { MapInitialized, SelectLocation } from '../../state/location/location.actions';

describe('MapFacade', () => {
  let facade: MapFacade;
  let store: MockStore;
  let mapBackgroundService: any;
  let errorHandlingService: any;

  beforeEach(() => {
    mapBackgroundService = {
      getImageDimentions: jest.fn()
    };
    errorHandlingService = {
      handle: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MapFacade,
        { provide: MapBackgroundService, useValue: mapBackgroundService },
        { provide: ErrorHandlingService, useValue: errorHandlingService },
        provideMockStore()
      ]
    });

    facade = TestBed.inject(MapFacade);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('dispatchMapInit', () => {
    it('should dispatch MapInitialized action', () => {
      const spy = jest.spyOn(store, 'dispatch');

      facade.dispatchMapInit();

      expect(spy).toHaveBeenCalledWith(new MapInitialized());
    });
  });

  describe('getImageDimentions', () => {
    it('should call map background service with environment URL', () => {
      const mockDimensions = { width: 800, height: 600 };
      mapBackgroundService.getImageDimentions.mockReturnValue(cold('a', { a: mockDimensions }));

      const result = facade.getImageDimentions();

      expect(mapBackgroundService.getImageDimentions).toHaveBeenCalled();
      expect(result).toBeObservable(cold('a', { a: mockDimensions }));
    });
  });

  describe('selectLocation', () => {
    const location = { id: 'test', name: 'test', mapPosition: { x: 0, y: 0 }, updatedAt: new Date() };

    it('should dispatch SelectLocation when measurements exist for the location', () => {
      const mockMeasurmentsByLocation = { test: [{ value: 1 }] };

      const ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const errorSpy = jest.spyOn(errorHandlingService, 'handle');

      ts.run(({ cold, expectObservable }) => {
        (facade as any).measurmentsByLocation$ = cold('a|', { a: mockMeasurmentsByLocation });

        const result = facade.selectLocation(location);

        expectObservable(result).toBe('(a|)', { a: mockMeasurmentsByLocation });
      });

      expect(dispatchSpy).toHaveBeenCalledWith(new SelectLocation({ location }));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should call error handler and not dispatch when there are no measurements', () => {
      const mockEmpty = {};

      const ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const errorSpy = jest.spyOn(errorHandlingService, 'handle');

      ts.run(({ cold, expectObservable }) => {
        (facade as any).measurmentsByLocation$ = cold('a|', { a: mockEmpty });

        const result = facade.selectLocation(location);

        expectObservable(result).toBe('(a|)', { a: mockEmpty });
      });

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      const handledError = errorHandlingService.handle.mock.calls[0][0];
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toBe('Brak aktualnych danych do wyświetlenia na wykresie.');
    });
  });
});
