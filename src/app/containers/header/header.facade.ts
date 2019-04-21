import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectMeasurmentsLoading } from '../../state/selectors';
import { RefreshButtonClick } from 'app/state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class HeaderFacade {
  public refreshing = this.store.select(selectMeasurmentsLoading);

  constructor (
    private store: Store<State>
  ) {}

  refresh() {
    this.store.dispatch(new RefreshButtonClick());
  }
}
