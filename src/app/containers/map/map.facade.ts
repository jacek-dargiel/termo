import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isEmpty } from '../../helpers/lodash';
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
  public loading$ = this.store.select(selectors.selectLocationLoading);
  public locations$ = this.store.select(selectors.selectLocationsMappedWithKeyMeasurmentValues);
  public selectedLocation$ = this.store.select(selectors.selectSelectedLocation);

  private measurmentsByLocation$ = this.store.select(selectors.selectMeasurmentsByLocation);

  constructor(
    private store: Store<State>,
    private mapBackgroundService: MapBackgroundService,
    private errorHandlingService: ErrorHandlingService,
  ) {}

  dispatchMapInit() {
    this.store.dispatch(new MapInitialized());
  }

  getImageDimentions() {
    let url = environment.mapBackgroundUrl;
    return this.mapBackgroundService.getImageDimentions(url);
  }

  selectLocation(location: Location) {
    return this.measurmentsByLocation$.pipe(
      first(),
      tap(measurmentsByLocation => {
        let locationMeasurments = measurmentsByLocation[location.id];
        if (isEmpty(locationMeasurments)) {
          this.errorHandlingService.handle(new Error('Brak aktualnych danych do wyświetlenia na wykresie.'));
          return;
        }
        this.store.dispatch(new SelectLocation({location}));
      })
    );
  }
}
