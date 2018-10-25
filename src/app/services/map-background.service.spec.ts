import { TestBed, inject } from '@angular/core/testing';

import { MapBackgroundService } from './map-background.service';
import { isObservable } from 'rxjs';

describe('MapBackgroundService', () => {
  let oService: MapBackgroundService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapBackgroundService]
    });
    oService = TestBed.get(MapBackgroundService);
  });

  it('should be created', inject([MapBackgroundService], (service: MapBackgroundService) => {
    expect(service).toBeTruthy();
  }));
  describe('getImageDimentions', () => {
    // tslint:disable-next-line:max-line-length
    let imageUrl = 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';
    it('should return a observable', inject([MapBackgroundService], (service: MapBackgroundService) => {
      let dimentions$ = service.getImageDimentions(imageUrl);
      expect(isObservable(dimentions$)).toBeTruthy();
    }));

    // can't test thease
    // @see https://github.com/jsdom/jsdom/issues/1816
    xit('should emit error for invalid URL', () => {} );
    xit('should emit dimentions', done => {});
  });
});
