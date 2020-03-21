import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';

import { environment } from '../../environments/environment';

Sentry.init({
  dsn: environment.sentryDsn
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  handleError(error: any) {
    Sentry.captureException(error.originalError || error);
    // Sentry.showReportDialog({ eventId });
  }
}
