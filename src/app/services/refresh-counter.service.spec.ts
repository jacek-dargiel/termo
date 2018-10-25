import { TestBed, inject } from '@angular/core/testing';

import { RefreshSignalService } from './refresh-signal.service';

describe('RefreshSignalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshSignalService]
    });
  });

  it('should be created', inject([RefreshSignalService], (service: RefreshSignalService) => {
    expect(service).toBeTruthy();
  }));
});
