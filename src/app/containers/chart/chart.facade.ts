import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectSelectedLocation, selectSelectedLocationMeasurments } from '../../state/selectors';
import { SelectLocation } from '../../state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class ChartFacade {
  private store = inject<Store<State>>(Store);

  public selectedLocation$ = this.store.select(selectSelectedLocation);
  public selectedLocationMeasurments$ = this.store.select(selectSelectedLocationMeasurments);

  closeChart() {
    this.store.dispatch(new SelectLocation({ location: undefined }));
  }
}
