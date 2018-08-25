import { Injectable } from '@angular/core';
import { SnackbarService } from './snackbar.service';

@Injectable()
export class ErrorHandlingService {
  constructor(
    private snackbarService: SnackbarService,
  ) {

  }
  handle(error: Error) {
    let dataObject = {
      message: error.message,
      timeout: 5000,
    };
    this.snackbarService.show(dataObject as any);
  }
}
