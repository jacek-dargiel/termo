import { TestBed, inject } from '@angular/core/testing';

import { RefreshSignalService } from './refresh-signal.service';
import { isObservable } from 'rxjs';

describe('RefreshSignalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshSignalService]
    });
  });

  it('should be created', inject([RefreshSignalService], (service: RefreshSignalService) => {
    expect(service).toBeTruthy();
  }));

  it('should expose a signal observable', inject([RefreshSignalService], (service: RefreshSignalService) => {
    expect(isObservable(service.signal)).toBeTruthy();
  }));
});
