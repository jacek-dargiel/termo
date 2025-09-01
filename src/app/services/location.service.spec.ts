import { TestBed, inject } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { LocationService } from './location.service';
import { of, isObservable } from 'rxjs';
import { ApiService } from './api.service';

require('jest-marbles');

class MockApiService {
  get = jest.fn(() => of([]));
}

describe('LocationService', () => {
  let api: MockApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        LocationService,
        { provide: ApiService, useClass: MockApiService },
        provideHttpClient(withInterceptorsFromDi()),
    ]
});
    api = TestBed.get(ApiService);
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
  }));

  describe('getLocations', () => {
    it('should return observable', inject([LocationService], (service: LocationService) => {
      let locations$ = service.getLocations();
      expect(isObservable(locations$)).toBeTruthy();
    }));
    it('should call the API', inject([LocationService], (service: LocationService) => {
      service.getLocations().subscribe();
      expect(api.get).toHaveBeenCalledWith('/groups/tunele/feeds');
    }));
    it('should throw when 0 locations returned by feed', inject([LocationService], (service: LocationService) => {
      let locations$ = service.getLocations();
      locations$.subscribe({
        next: () => fail('Should not emit a value'),
        error: (error) => {
          expect(error.message).toBe('0 Locations recived from API.');
        }
      });
    }));
  });

  describe('parseMapPosition', () => {
    it('should throw for invalid JSON', inject([LocationService], (service: LocationService) => {
      expect(() => service.parseMapPosition('{something invalid as JSON}'))
        .toThrow();
    }));
    it('should throw when location data not provided', inject([LocationService], (service: LocationService) => {
      expect(() => service.parseMapPosition('{}'))
        .toThrow();
      expect(() => service.parseMapPosition('{ "x": 0.5 }'))
        .toThrow();
      expect(() => service.parseMapPosition('{ "y": 0.5 }'))
        .toThrow();
      expect(() => service.parseMapPosition('{ "x": 0.5, "y": 0.5 }'))
        .not
        .toThrow();
    }));
  });
});
