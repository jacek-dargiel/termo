import { enableProdMode, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from 'environments/environment';
import { ErrorHandlingService } from './app/services/error-handling.service';
import { LocationService } from './app/services/location.service';
import { MeasurmentService } from './app/services/measurment.service';
import { MapFacade } from './app/containers/map/map.facade';
import { TERMO_CURRENT_TIME_FACTORY } from './app/pipes/current-time.injection-token';
import { SentryErrorHandler } from './app/services/sentry.error-handler';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from './app/state/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app/app.effects';
import { LineChartModule } from '@swimlane/ngx-charts';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, StoreModule.forRoot(reducers, { metaReducers }), !environment.production ? StoreDevtoolsModule.instrument({ serialize: { options: { map: true, set: true } }, connectInZone: true }) : [], EffectsModule.forRoot([AppEffects]), StoreModule.forFeature('location', fromLocation.reducer), StoreModule.forFeature('measurment', fromMeasurment.reducer), LineChartModule),
        ErrorHandlingService,
        LocationService,
        MeasurmentService,
        MapFacade,
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() },
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch(err => console.log(err));
