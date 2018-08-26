import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { MapInitialized, SelectLocation } from '../../state/location/location.actions';
import * as selectors from '../../state/selectors';
import { MapBackgroundService } from '../../services/map-background.service';
import { environment } from 'environments/environment';
import { Location } from '../../state/location/location.model';

@Injectable()
export class MapFacade {
  public locationsLoading$ = this.store.select(selectors.selectIdsOfLocationsLoadingMeasurments);
  public locations$ = this.store.select(selectors.selectLocationsMappedWithKeyMeasurmentValues);
  public selectedLocation$ = this.store.select(selectors.selectSelectedLocation);

  constructor(
    private store: Store<State>,
    private mapBackgroundService: MapBackgroundService,
  ) {}

  dispatchMapInit() {
    this.store.dispatch(new MapInitialized());
  }

  getImageDimentions() {
    let url = environment.mapBackgroundUrl;
    return this.mapBackgroundService.getImageDimentions(url);
  }

  selectLocation(location: Location) {
    this.store.dispatch(new SelectLocation({location}));
  }
}
