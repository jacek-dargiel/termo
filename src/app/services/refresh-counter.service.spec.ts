import { TestBed, inject } from '@angular/core/testing';

import { RefreshCounterService } from './refresh-counter.service';

describe('RefreshCounterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshCounterService]
    });
  });

  it('should be created', inject([RefreshCounterService], (service: RefreshCounterService) => {
    expect(service).toBeTruthy();
  }));
});
