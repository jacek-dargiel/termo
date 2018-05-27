import { TestBed, inject } from '@angular/core/testing';

import { MeasurmentService } from './measurment.service';

describe('MeasurmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeasurmentService]
    });
  });

  it('should be created', inject([MeasurmentService], (service: MeasurmentService) => {
    expect(service).toBeTruthy();
  }));
});
