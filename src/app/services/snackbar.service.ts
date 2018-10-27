import { Injectable } from '@angular/core';

import { ErrorHandlingService } from './error-handling.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MDCSnackbarData } from '@material/snackbar/foundation';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public messages: Observable<MDCSnackbarData> = this.errorHandling.errors$.pipe(
    map(error => this.errorToSnackbarData(error) as any)
  );

  constructor(private errorHandling: ErrorHandlingService) {}

  errorToSnackbarData(error: Error): Partial<MDCSnackbarData> {
    return {
      message: error.message,
      timeout: 5000,
    };
  }
}
