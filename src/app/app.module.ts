import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import * as fromLocation from './location/location.reducer';
import * as fromMeasurment from './measurment/measurment.reducer';
import { MapComponent } from './map/map.component';
import { MapLocationComponent } from './map-location/map-location.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapLocationComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects]),
    StoreModule.forFeature('location', fromLocation.reducer),
    StoreModule.forFeature('measurment', fromMeasurment.reducer)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
