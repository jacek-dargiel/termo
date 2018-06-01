import { Injectable } from '@angular/core';
import { RefreshCounterService } from '../../services/refresh-counter.service';
import { map, first } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectIdsOfLocationsLoadingMeasurments, selectAllLocations } from '../../state/selectors';
import { RefreshMeasurmentsStart } from '../../state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class HeaderFacade {
  public progress = this.refreshCounter.timer.pipe(
    map(timeLeft => timeLeft * 1000),
    map(timeLeft => (environment.refreshTimeout - timeLeft) / environment.refreshTimeout),
  );
  public refreshing = this.store.select(selectIdsOfLocationsLoadingMeasurments).pipe(
    map(ids => ids.length > 0),
  );

  constructor (
    private refreshCounter: RefreshCounterService,
    private store: Store<State>
  ) {}

  refresh() {
    this.store.select(selectAllLocations).pipe(
      first(),
    )
      .subscribe(locations => this.store.dispatch(new RefreshMeasurmentsStart({ locations })));
  }
}
