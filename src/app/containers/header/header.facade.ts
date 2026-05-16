import { Injectable, inject } from '@angular/core';
import { RefreshSignalService } from '../../services/refresh-signal.service';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectMeasurementsLoading } from '../../state/selectors';
import { RefreshButtonClick } from '../../state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class HeaderFacade {
  private refreshSignal = inject(RefreshSignalService);
  private store = inject<Store<State>>(Store);

  public progress = this.refreshSignal.counter.pipe(
    map(timeLeft => timeLeft * 1000),
    map(timeLeft => (environment.refreshTimeout - timeLeft) / environment.refreshTimeout),
  );
  public refreshing = this.store.select(selectMeasurementsLoading);

  refresh() {
    this.store.dispatch(new RefreshButtonClick());
  }
}
