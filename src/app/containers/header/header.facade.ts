import { Injectable } from '@angular/core';
import { RefreshSignalService } from '../../services/refresh-signal.service';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectMeasurmentsLoading } from '../../state/selectors';
import { RefreshButtonClick } from 'app/state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class HeaderFacade {
  public progress = this.refreshSignal.signal.pipe(
    map(timeLeft => timeLeft * 1000),
    map(timeLeft => (environment.refreshTimeout - timeLeft) / environment.refreshTimeout),
  );
  public refreshing = this.store.select(selectMeasurmentsLoading);

  constructor (
    private refreshSignal: RefreshSignalService,
    private store: Store<State>
  ) {}

  refresh() {
    this.store.dispatch(new RefreshButtonClick());
  }
}
