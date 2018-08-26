import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../state/reducers';
import { selectSelectedLocation } from '../../state/selectors';
import { SelectLocation } from '../../state/location/location.actions';

@Injectable({
  providedIn: 'root',
})
export class ChartFacade {
  public selectedLocation$ = this.store.select(selectSelectedLocation);

  constructor (
    private store: Store<State>
  ) {}

  closeChart() {
    this.store.dispatch(new SelectLocation({ location: undefined }));
  }
}
