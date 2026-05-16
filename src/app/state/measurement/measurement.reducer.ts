import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Measurement } from './measurement.model';
import { MeasurementActions, MeasurementActionTypes } from './measurement.actions';
import { LocationActionTypes, LocationActions } from '../location/location.actions';
import { compareAsc } from 'date-fns';

export interface State extends EntityState<Measurement> {
  loading: boolean;
}

export const adapter: EntityAdapter<Measurement> = createEntityAdapter<Measurement>({
  sortComparer: (a: Measurement, b: Measurement) => compareAsc(a.created_at, b.created_at),
});

export const initialState: State = adapter.getInitialState({
  loading: false,
});

export function reducer(
  state = initialState,
  action: MeasurementActions | LocationActions
): State {
  switch (action.type) {
    case LocationActionTypes.RefreshMeasurementsOnBtnClick:
    case LocationActionTypes.RefreshMeasurementsOnLocationsLoaded:
    {
      return {
        ...state,
        loading: true,
      };
    }

    case MeasurementActionTypes.FetchMeasurementsSuccess: {
      return adapter.addMany(action.payload.measurements, {
        ...state,
        loading: false,
      });
    }

    case MeasurementActionTypes.FetchMeasurementsError: {
      return {
        ...state,
        loading: false,
      };
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
