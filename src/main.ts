import { enableProdMode, ErrorHandler, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { environment } from 'environments/environment';
import { ErrorHandlingService } from './app/services/error-handling.service';
import { SentryErrorHandler } from './app/services/sentry.error-handler';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { httpErrorInterceptor } from './app/interceptors/http-error.interceptor';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule),
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        provideHttpClient(withXhr(), withInterceptors([httpErrorInterceptor])),
        provideZonelessChangeDetection(),
        provideHotToastConfig({
          position: 'bottom-center',
          theme: 'snackbar',
          duration: environment.snackbarDefaultTimeout,
        }),
    ]
})
  .catch(err => console.log(err));
