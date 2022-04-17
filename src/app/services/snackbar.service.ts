import { Injectable } from '@angular/core';

import { ErrorHandlingService } from './error-handling.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface SnackbarData {
  message: string;
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public messages: Observable<SnackbarData> = this.errorHandling.errors$.pipe(
    map(error => this.errorToSnackbarData(error) as any)
  );

  constructor(private errorHandling: ErrorHandlingService) {}

  errorToSnackbarData(error: Error): Partial<SnackbarData> {
    return {
      message: error.message,
      timeout: environment.snackbarDefaultTimeout,
    };
  }
}
