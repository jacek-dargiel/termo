import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Location } from './location.model';
import { LocationActions, LocationActionTypes } from './location.actions';
import { MeasurmentActionTypes, MeasurmentActions } from '../measurment/measurment.actions';
import { Measurment } from '../measurment/measurment.model';
import { compareAsc } from 'date-fns/esm';
import { Dictionary } from '@ngrx/entity/src/models';
import last from 'lodash/fp/last';

export interface State extends EntityState<Location> {
  loading: boolean;
  locationsLoadingMeasurments: string[] | number[];
  latestMeasurmentIDs: Dictionary<string>;
}

export let adapter: EntityAdapter<Location> = createEntityAdapter<Location>();

export const INITIAL_STATE: State = adapter.getInitialState({
  loading: false,
  locationsLoadingMeasurments: [],
  latestMeasurmentIDs: {},
});

export function reducer(
  state = INITIAL_STATE,
  action: LocationActions | MeasurmentActions
): State {
  switch (action.type) {
    case LocationActionTypes.AddLocation: {
      return adapter.addOne(action.payload.location, state);
    }

    case LocationActionTypes.UpsertLocation: {
      return adapter.upsertOne(action.payload.location, state);
    }

    case LocationActionTypes.AddLocations: {
      return adapter.addMany(action.payload.locations, state);
    }

    case LocationActionTypes.UpsertLocations: {
      return adapter.upsertMany(action.payload.locations, state);
    }

    case LocationActionTypes.UpdateLocation: {
      return adapter.updateOne(action.payload.location, state);
    }

    case LocationActionTypes.UpdateLocations: {
      return adapter.updateMany(action.payload.locations, state);
    }

    case LocationActionTypes.DeleteLocation: {
      return adapter.removeOne(action.payload.id, state);
    }

    case LocationActionTypes.DeleteLocations: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case LocationActionTypes.FetchLocationsSuccess: {
      let loadedState = {
        ...state,
        loading: false,
      };
      return adapter.addAll(action.payload.locations, loadedState);
    }

    case LocationActionTypes.ClearLocations: {
      return adapter.removeAll(state);
    }

    case LocationActionTypes.MapInitialized: {
      return {
        ...state,
        loading: true,
      };
    }

    case LocationActionTypes.RefreshMeasurmentsStart: {
      return {
        ...state,
        locationsLoadingMeasurments: action.payload.locations.map(location => location.id),
      };
    }

    case LocationActionTypes.FetchLocationsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case MeasurmentActionTypes.FetchMeasurmentsSuccess: {
      let locationsState = state;
      if (action.payload.measurments.length > 0) {
        let sortedMeasurments = sortMeasurments(action.payload.measurments);
        let latestMeasurment = last(sortedMeasurments);
        locationsState = adapter.updateOne({id: action.payload.location.id, changes: { updatedAt: latestMeasurment.created_at }}, state);
        locationsState = {
          ...locationsState,
          latestMeasurmentIDs: {
            ...locationsState.latestMeasurmentIDs,
            [action.payload.location.id]: latestMeasurment.id,
          }
        };
      }

      let locationsLoadingMeasurments = state.locationsLoadingMeasurments as string[];
      locationsLoadingMeasurments = locationsLoadingMeasurments.filter(locationID => locationID !== action.payload.location.id);
      return {
        ...locationsState,
        locationsLoadingMeasurments,
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

function sortMeasurments(measurments: Measurment[]) {
  return [...measurments].sort((a: Measurment, b: Measurment) => compareAsc(a.created_at, b.created_at));
}
