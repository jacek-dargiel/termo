import { enableProdMode, ErrorHandler, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { environment } from 'environments/environment';
import { ErrorHandlingService } from './app/services/error-handling.service';
import { TERMO_CURRENT_TIME_FACTORY } from './app/pipes/current-time.injection-token';
import { SentryErrorHandler } from './app/services/sentry.error-handler';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule),
        ErrorHandlingService,
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() },
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideZonelessChangeDetection(),
        provideHotToastConfig({
          position: 'bottom-center',
          theme: 'snackbar',
          duration: environment.snackbarDefaultTimeout,
        }),
    ]
})
  .catch(err => console.log(err));
