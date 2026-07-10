import { Injectable, inject } from '@angular/core';
import { Subject, auditTime } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';
import * as Sentry from '@sentry/browser';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
  private readonly toast = inject(HotToastService);
  private readonly errorSubject = new Subject<Error>();

  constructor() {
    this.errorSubject
      .pipe(auditTime(environment.snackbarDefaultTimeout))
      .subscribe((error) => this.toast.error(error.message, { icon: '' }));
  }

  /** Throttled error display — for recurring/async errors (HTTP, network). */
  handle(error: Error): void {
    Sentry.captureException(error);
    this.errorSubject.next(error);
  }

  /** Immediate error display — for synchronous validation errors. No throttle. */
  handleImmediate(error: Error): void {
    this.toast.error(error.message, { icon: '' });
  }
}
