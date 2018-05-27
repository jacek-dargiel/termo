import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { MapInitialized } from '../../state/location/location.actions';
import * as selectors from '../../state/selectors';

@Injectable()
export class MapFacade {
  public locationsLoading$ = this.store.select(selectors.selectLocationLoading);
  public locations$ = this.store.select(selectors.selectLocationsMappedWithKeyMeasurmentValues);

  constructor(
    private store: Store<State>
  ) {}

  dispatchMapInit() {
    this.store.dispatch(new MapInitialized());
  }
}
