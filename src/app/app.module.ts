import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';

import { LineChartModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './state/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import * as fromLocation from './state/location/location.reducer';
import * as fromMeasurment from './state/measurment/measurment.reducer';
import { MapComponent } from './containers/map/map.component';
import { MapLocationComponent } from './components/map-location/map-location.component';
import { LocationService } from './services/location.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandlingService } from './services/error-handling.service';
import { MapFacade } from './containers/map/map.facade';
import { MeasurmentService } from './services/measurment.service';
import { IsLocationOutdatedPipe } from './pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { ToFixedPipe } from './pipes/to-fixed.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HeaderComponent } from './containers/header/header.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { ChartComponent } from './containers/chart/chart.component';
import { TERMO_CURRENT_TIME_FACTORY } from './pipes/current-time.injection-token';
import { RefreshButtonComponent } from './components/refresh-button/refresh-button.component';
import { SentryErrorHandler } from './services/sentry.error-handler';

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        !environment.production ? StoreDevtoolsModule.instrument({ serialize: { options: { map: true, set: true } }, connectInZone: true }) : [],
        EffectsModule.forRoot([AppEffects]),
        StoreModule.forFeature('location', fromLocation.reducer),
        StoreModule.forFeature('measurment', fromMeasurment.reducer),
        LineChartModule,
        MapComponent,
        MapLocationComponent,
        IsLocationOutdatedPipe,
        RelativeTimePipe,
        ToFixedPipe,
        SpinnerComponent,
        HeaderComponent,
        SnackbarComponent,
        ChartComponent,
        RefreshButtonComponent
    ], providers: [
        ErrorHandlingService,
        LocationService,
        MeasurmentService,
        MapFacade,
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => new Date() },
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
