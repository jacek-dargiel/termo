import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { FetchLocations } from '../../state/location/location.actions';
import * as locationSelectors from '../../state/location/location.selectors';

@Injectable()
export class MapFacade {
  public locationsLoading$ = this.store.select(locationSelectors.selectLoading);
  public locations$ = this.store.select(locationSelectors.selectAllLocations);

  constructor(
    private store: Store<State>
  ) {}

  fetchLocations() {
    this.store.dispatch(new FetchLocations());
  }
}
