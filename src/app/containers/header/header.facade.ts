import { Injectable } from '@angular/core';
import { RefreshCounterService } from '../../services/refresh-counter.service';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectIdsOfLocationsLoadingMeasurments } from '../../state/selectors';

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
}
