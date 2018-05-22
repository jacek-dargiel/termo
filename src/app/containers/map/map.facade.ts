import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { FetchLocations } from '../../state/location/location.actions';

@Injectable()
export class MapFacade {
  constructor(
    private store: Store<State>
  ) {}

  fetchLocations() {
    this.store.dispatch(new FetchLocations());
  }
}
