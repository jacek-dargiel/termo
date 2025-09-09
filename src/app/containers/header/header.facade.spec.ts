import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { cold } from 'jest-marbles';
import { HeaderFacade } from './header.facade';
import { RefreshSignalService } from '../../services/refresh-signal.service';
import { RefreshButtonClick } from '../../state/location/location.actions';

// Mock the environment module
jest.doMock('environments/environment', () => ({
  environment: {
    refreshTimeout: 300000 // 5 minutes in milliseconds
  }
}));

describe('HeaderFacade', () => {
  let store: MockStore;
  let refreshSignalService: any;

  beforeEach(() => {
    refreshSignalService = {
      counter: cold('a', { a: 5 })
    };

    TestBed.configureTestingModule({
      providers: [
        HeaderFacade,
        { provide: RefreshSignalService, useValue: refreshSignalService },
        provideMockStore()
      ]
    });

    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    const facade = TestBed.inject(HeaderFacade);
    expect(facade).toBeTruthy();
  });

  describe('refresh', () => {
    it('should dispatch RefreshButtonClick action', () => {
      const facade = TestBed.inject(HeaderFacade);
      const spy = jest.spyOn(store, 'dispatch');

      facade.refresh();

      expect(spy).toHaveBeenCalledWith(new RefreshButtonClick());
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress based on refresh signal counter', () => {
      // Test with counter value of 5 seconds remaining
      refreshSignalService.counter = cold('a', { a: 5 });
      const facade = TestBed.inject(HeaderFacade);

      // Progress should be (300000 - 5000) / 300000 = 0.983...
      const expected = cold('a', { a: 0.9833333333333333 });
      expect(facade.progress).toBeObservable(expected);
    });

    it('should handle different counter values', () => {
      // Test with counter value of 0 seconds remaining (refresh imminent)
      refreshSignalService.counter = cold('a', { a: 0 });
      const facade = TestBed.inject(HeaderFacade);

      // Progress should be (300000 - 0) / 300000 = 1.0
      const expected = cold('a', { a: 1.0 });
      expect(facade.progress).toBeObservable(expected);
    });

    it('should handle refresh timeout value', () => {
      // Test with counter value of 15 seconds remaining
      refreshSignalService.counter = cold('a', { a: 15 });
      const facade = TestBed.inject(HeaderFacade);

      // Progress should be (300000 - 15000) / 300000 = 0.95
      const expected = cold('a', { a: 0.95 });
      expect(facade.progress).toBeObservable(expected);
    });

    it('should handle multiple counter values in sequence', () => {
      // Test that progress updates when counter changes
      refreshSignalService.counter = cold('a-b-c', { a: 10, b: 5, c: 0 });
      const facade = TestBed.inject(HeaderFacade);

      const expected = cold('a-b-c', {
        a: 0.9666666666666667,  // (300000 - 10000) / 300000
        b: 0.9833333333333333,  // (300000 - 5000) / 300000
        c: 1.0                  // (300000 - 0) / 300000
      });
      expect(facade.progress).toBeObservable(expected);
    });

    it('should handle edge case when counter equals refresh timeout', () => {
      // Test with counter value equal to refresh timeout (300 seconds)
      refreshSignalService.counter = cold('a', { a: 300 });
      const facade = TestBed.inject(HeaderFacade);

      // Progress should be (300000 - 300000) / 300000 = 0.0
      const expected = cold('a', { a: 0.0 });
      expect(facade.progress).toBeObservable(expected);
    });

    it('should handle counter values greater than refresh timeout', () => {
      // Test with counter value greater than refresh timeout
      refreshSignalService.counter = cold('a', { a: 350 });
      const facade = TestBed.inject(HeaderFacade);

      // Progress should be (300000 - 350000) / 300000 = -0.166...
      const expected = cold('a', { a: -0.16666666666666666 });
      expect(facade.progress).toBeObservable(expected);
    });
  });

  describe('refresh signal service integration', () => {
    it('should use refresh signal service counter', () => {
      const facade = TestBed.inject(HeaderFacade);
      // Verify that the facade uses the refresh signal service
      expect(refreshSignalService.counter).toBeDefined();
      expect(facade.progress).toBeDefined();
    });

    it('should properly transform counter values to progress', () => {
      // Test the transformation pipeline
      refreshSignalService.counter = cold('a-b', { a: 60, b: 120 });
      const facade = TestBed.inject(HeaderFacade);

      const expected = cold('a-b', {
        a: 0.8,   // (300000 - 60000) / 300000 = 0.8
        b: 0.6    // (300000 - 120000) / 300000 = 0.6
      });
      expect(facade.progress).toBeObservable(expected);
    });
  });
});
