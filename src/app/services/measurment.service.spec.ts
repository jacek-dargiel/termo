import { TestBed, inject } from '@angular/core/testing';

import { of, isObservable } from 'rxjs';

import { MeasurmentService } from './measurment.service';
import { ApiService } from './api.service';
import { Measurment } from 'app/state/measurment/measurment.model';

import { cold } from 'jest-marbles';

class MockApiSerivce {
  get = jest.fn(url => {
    if (url === '/feeds/1234/data') {
      return of([
        {
          id: '123',
          value: '20.1',
          feed_id: 1234,
          feed_key: 'temperatura.gorny_tunel',
          created_at: '2018-09-19T15:45:00Z',
          created_epoch: 1537371900,
        },
        {
          id: '124',
          value: '20.2',
          feed_id: 1234,
          feed_key: 'temperatura.gorny_tunel',
          created_at: '2018-09-19T15:48:00Z',
          created_epoch: 1537372080,
        }
      ]);
    }
    if (url === '/feeds/1000/data') {
      return of([]);
    }
  });
}

describe('MeasurmentService', () => {
  let api: ApiService;

  beforeEach(() => {
    let bed = TestBed.configureTestingModule({
      providers: [
        MeasurmentService,
        { provide: ApiService, useClass: MockApiSerivce }
      ]
    });
    api = bed.get(ApiService);
  });

  it('should be created', inject([MeasurmentService], (service: MeasurmentService) => {
    expect(service).toBeTruthy();
  }));
  describe('getMeasurments', () => {
    it('should return observable', inject([MeasurmentService], (service: MeasurmentService) => {
      let measurments$ = service.getMeasurments('1234');
      expect(isObservable(measurments$)).toBeTruthy();
    }));
    it('should call the API', inject([MeasurmentService], (service: MeasurmentService) => {
      service.getMeasurments('1234').subscribe();
      expect((api.get as jest.Mock).mock.calls[0][0]).toBe('/feeds/1234/data');
    }));
    it('should throw when 0 measurments recived', inject([MeasurmentService], (service: MeasurmentService) => {
      let measurments$ = service.getMeasurments('1000');
      measurments$.subscribe({
        next: () => fail('Should not emit a value'),
        error: (error) => {
          expect(error.message).toBe('0 Measurments recived from API.');
        }
      });
    }));
    it('should emit parsed measurments', inject([MeasurmentService], (service: MeasurmentService) => {
      let expected: Measurment[] = [
        {
          id: '123',
          value: 20.1,
          created_at: new Date('2018-09-19T15:45:00Z'),
          feed_id: 1234,
          feed_key: 'temperatura.gorny_tunel',
        },
        {
          id: '124',
          value: 20.2,
          created_at: new Date('2018-09-19T15:48:00Z'),
          feed_id: 1234,
          feed_key: 'temperatura.gorny_tunel',
        },
      ];
      let expected$ = cold('(a|)', { a: expected });
      let measurments$ = service.getMeasurments('1234');
      expect(measurments$).toBeObservable(expected$);
    }));
  });
});
