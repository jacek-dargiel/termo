import { TestBed, inject } from '@angular/core/testing';

import { ErrorHandlingService } from './error-handling.service';
import { isObservable } from 'rxjs';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlingService]
    });
  });

  it('should be created', inject([ErrorHandlingService], (service: ErrorHandlingService) => {
    expect(service).toBeTruthy();
  }));

  it('should expose an `errors$` observable', inject([ErrorHandlingService], (service: ErrorHandlingService) => {
    expect(isObservable(service.errors$)).toBeTruthy();
  }));

  it(
    'should emit errors on the `errors$` observable when `handle` is called',
    inject([ErrorHandlingService], (service: ErrorHandlingService) => {
      let handler = jest.fn();
      let error = new Error('Some error');

      let subscription = service.errors$.subscribe(handler);
      service.handle(error);

      expect(handler).toHaveBeenCalledWith(error);

      subscription.unsubscribe();
    })
  );
});
