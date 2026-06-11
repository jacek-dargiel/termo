import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';

import { environment } from '../../environments/environment';

interface ErrorWithOriginalError extends Error {
  originalError?: Error;
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  static getReleaseId() {
    try {
      const linkEl = document.querySelector('head link[rel="DC.Identifier"]');
      const link = linkEl?.getAttribute('href');

      const commitIdRegex = /https:\/\/github.com\/.+\/commit\/([\da-f]+)/;
      return link?.match(commitIdRegex)?.[1];
    } catch {
      return undefined;
    }
  }

  handleError(error: ErrorWithOriginalError) {
    Sentry.captureException(error.originalError || error);
    // Sentry.showReportDialog({ eventId });
  }
}

Sentry.init({
  dsn: environment.sentryDsn,
  release: SentryErrorHandler.getReleaseId()
});
