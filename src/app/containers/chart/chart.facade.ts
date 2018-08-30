import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectSelectedLocation, selectSelectedLocationMeasurments } from '../../state/selectors';
import { SelectLocation } from '../../state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class ChartFacade {
  public selectedLocation$ = this.store.select(selectSelectedLocation);
  public selectedLocationMeasurments$ = this.store.select(selectSelectedLocationMeasurments);

  constructor (
    private store: Store<State>
  ) {}

  closeChart() {
    this.store.dispatch(new SelectLocation({ location: undefined }));
  }
}
