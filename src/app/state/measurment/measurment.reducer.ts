import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Measurment } from './measurment.model';
import { MeasurmentActions, MeasurmentActionTypes } from './measurment.actions';
import { LocationActionTypes, LocationActions } from '../location/location.actions';
import { compareAsc } from 'date-fns';

export interface State extends EntityState<Measurment> {
  loading: boolean;
}

export const adapter: EntityAdapter<Measurment> = createEntityAdapter<Measurment>({
  sortComparer: (a: Measurment, b: Measurment) => compareAsc(a.created_at, b.created_at),
});

export const initialState: State = adapter.getInitialState({
  loading: false,
});

export function reducer(
  state = initialState,
  action: MeasurmentActions | LocationActions
): State {
  switch (action.type) {
    case LocationActionTypes.RefreshMeasurmentsOnBtnClick:
    case LocationActionTypes.RefreshMeasurmentsOnLocationsLoaded:
    {
      return {
        ...state,
        loading: true,
      };
    }

    case MeasurmentActionTypes.FetchMeasurmentsSuccess: {
      return adapter.addMany(action.payload.measurments, {
        ...state,
        loading: false,
      });
    }

    case MeasurmentActionTypes.FetchMeasurmentsError: {
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
