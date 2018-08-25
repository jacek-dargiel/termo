import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Measurment } from './measurment.model';
import { MeasurmentActions, MeasurmentActionTypes } from './measurment.actions';
import { LocationActionTypes, LocationActions } from '../location/location.actions';
import { compareAsc } from 'date-fns/esm';

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
    case MeasurmentActionTypes.AddMeasurment: {
      return adapter.addOne(action.payload.measurment, state);
    }

    case MeasurmentActionTypes.UpsertMeasurment: {
      return adapter.upsertOne(action.payload.measurment, state);
    }

    case MeasurmentActionTypes.AddMeasurments: {
      return adapter.addMany(action.payload.measurments, state);
    }

    case MeasurmentActionTypes.UpsertMeasurments: {
      return adapter.upsertMany(action.payload.measurments, state);
    }

    case MeasurmentActionTypes.UpdateMeasurment: {
      return adapter.updateOne(action.payload.measurment, state);
    }

    case MeasurmentActionTypes.UpdateMeasurments: {
      return adapter.updateMany(action.payload.measurments, state);
    }

    case MeasurmentActionTypes.DeleteMeasurment: {
      return adapter.removeOne(action.payload.id, state);
    }

    case MeasurmentActionTypes.DeleteMeasurments: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case MeasurmentActionTypes.LoadMeasurments: {
      return adapter.addAll(action.payload.measurments, state);
    }

    case MeasurmentActionTypes.ClearMeasurments: {
      return adapter.removeAll(state);
    }

    case LocationActionTypes.RefreshMeasurmentsStart: {
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
