import { TestBed, inject } from '@angular/core/testing';

import { MapBackgroundService } from './map-background.service';
import { isObservable } from 'rxjs';

describe('MapBackgroundService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapBackgroundService]
    });
  });

  it('should be created', inject([MapBackgroundService], (service: MapBackgroundService) => {
    expect(service).toBeTruthy();
  }));
  describe('getImageDimentions', () => {
    // eslint-disable-next-line max-len
    let imageUrl = 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';
    it('should return a observable', inject([MapBackgroundService], (service: MapBackgroundService) => {
      let dimentions$ = service.getImageDimentions(imageUrl);
      expect(isObservable(dimentions$)).toBeTruthy();
    }));

    // Mock global Image to simulate load/error events in a deterministic way
    let OriginalImage: any;
    beforeEach(() => {
      OriginalImage = (global as any).Image;
      class MockImage {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: ((err?: any) => void) | null = null;
        private _src: string = '';

        set src(val: string) {
          this._src = val;
          // simulate async loading
          setTimeout(() => {
            if (val.includes('error')) {
              this.onerror?.(new Error('mock load error'));
              return;
            }
            if (val.includes('wide')) {
              this.width = 800; this.height = 200;
            } else if (val.includes('tall')) {
              this.width = 200; this.height = 800;
            } else if (val.includes('square')) {
              this.width = 400; this.height = 400;
            } else {
              // default
              this.width = 100; this.height = 50;
            }
            this.onload?.();
          }, 0);
        }

        get src() { return this._src; }
      }
      (global as any).Image = MockImage;
    });

    afterEach(() => {
      (global as any).Image = OriginalImage;
    });

    it('should emit dimensions for a square image', done => {
      const service: MapBackgroundService = TestBed.get(MapBackgroundService);
      service.getImageDimentions('data:square').subscribe({
        next: dims => {
          expect(dims).toEqual({ width: 400, height: 400 });
          done();
        },
        error: err => done.fail(err)
      });
    });

    it('should emit dimensions for a wide image', done => {
      const service: MapBackgroundService = TestBed.get(MapBackgroundService);
      service.getImageDimentions('data:wide').subscribe({
        next: dims => {
          expect(dims).toEqual({ width: 800, height: 200 });
          done();
        },
        error: err => done.fail(err)
      });
    });

    it('should emit dimensions for a tall image', done => {
      const service: MapBackgroundService = TestBed.get(MapBackgroundService);
      service.getImageDimentions('data:tall').subscribe({
        next: dims => {
          expect(dims).toEqual({ width: 200, height: 800 });
          done();
        },
        error: err => done.fail(err)
      });
    });

    it('should emit error for invalid URL', done => {
      const service: MapBackgroundService = TestBed.get(MapBackgroundService);
      service.getImageDimentions('data:error').subscribe({
        next: () => done.fail('should not emit next'),
        error: err => {
          expect(err).toBeTruthy();
          done();
        }
      });
    });
  });
});
