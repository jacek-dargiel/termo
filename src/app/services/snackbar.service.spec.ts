import { TestBed, inject } from '@angular/core/testing';

import { SnackbarData, SnackbarService } from './snackbar.service';
import { ErrorHandlingService } from './error-handling.service';

describe('SnackbarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorHandlingService,
        SnackbarService,
      ]
    });
  });

  it('should be created', inject([SnackbarService], (service: SnackbarService) => {
    expect(service).toBeTruthy();
  }));

  it(
    'should emit `MDSnackbarData` objects',
    inject([SnackbarService, ErrorHandlingService], (snackbarService: SnackbarService, errorHandlingService: ErrorHandlingService) => {
      let handler = jest.fn();
      let error = new Error('Some error');

      let subscription = snackbarService.messages.subscribe(handler);
      errorHandlingService.handle(error);

      let expected: Partial<SnackbarData> = { message: error.message, timeout: 5000 };
      expect(handler).toHaveBeenCalledWith(expected);

      subscription.unsubscribe();
    })
  );
});
