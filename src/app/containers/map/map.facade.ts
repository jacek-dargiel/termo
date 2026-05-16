import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { MapInitialized, SelectLocation } from '../../state/location/location.actions';
import * as selectors from '../../state/selectors';
import { MapBackgroundService } from '../../services/map-background.service';
import { environment } from 'environments/environment';
import { Location } from '../../state/location/location.model';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { tap, first } from 'rxjs/operators';

@Injectable()
export class MapFacade {
  private store = inject<Store<State>>(Store);
  private mapBackgroundService = inject(MapBackgroundService);
  private errorHandlingService = inject(ErrorHandlingService);

  public loading$ = this.store.select(selectors.selectLocationLoading);
  public locations$ = this.store.select(selectors.selectLocationsMappedWithKeyMeasurementValues);
  public selectedLocation$ = this.store.select(selectors.selectSelectedLocation);

  private measurementsByLocation$ = this.store.select(selectors.selectMeasurementsByLocation);

  dispatchMapInit() {
    this.store.dispatch(new MapInitialized());
  }

  getImageDimentions() {
    let url = environment.mapBackgroundUrl;
    return this.mapBackgroundService.getImageDimentions(url);
  }

  selectLocation(location: Location) {
    return this.measurementsByLocation$.pipe(
      first(),
      tap(measurementsByLocation => {
        let locationMeasurements = measurementsByLocation[location.id];
        if (Array.isArray(locationMeasurements) && locationMeasurements.length === 0) {
          this.errorHandlingService.handle(new Error('Brak aktualnych danych do wyświetlenia na wykresie.'));
          return;
        }
        this.store.dispatch(new SelectLocation({location}));
      })
    );
  }
}
