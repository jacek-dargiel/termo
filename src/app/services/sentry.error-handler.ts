import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';

import { environment } from '../../environments/environment';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  static getReleaseId() {
    try {
      let linkEl = document.querySelector('head link[rel="DC.Identifier"]');
      let link = linkEl.getAttribute('href');

      let commitIdRegex = /https:\/\/github.com\/.+\/commit\/([\da-f]+)/;
      return link.match(commitIdRegex)[1];
    } catch (error) {
      return undefined;
    }
  }

  handleError(error: any) {
    Sentry.captureException(error.originalError || error);
    // Sentry.showReportDialog({ eventId });
  }
}

Sentry.init({
  dsn: environment.sentryDsn,
  release: SentryErrorHandler.getReleaseId()
});
