import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MeasurmentService } from './measurment.service';
import { ApiService } from './api.service';

class MockApiSerivce {
  get() {
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
}

describe('MeasurmentService', () => {
  let api: ApiService;
  let service: MeasurmentService;

  beforeEach(() => {
    let bed = TestBed.configureTestingModule({
      providers: [
        MeasurmentService,
        { provide: ApiService, useClass: MockApiSerivce }
      ]
    });
    api = bed.get(ApiService);
    service = bed.get(MeasurmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get measurments', (done) => {
    service.getMeasurments('123')
      .subscribe(measurments => {
        expect(measurments.length).toBe(2);
        done();
      });
  });
});
