import { TestBed, inject } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';
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
});
