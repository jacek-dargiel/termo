import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Location } from './location.model';
import { LocationActions, LocationActionTypes } from './location.actions';
import { MeasurmentActionTypes, MeasurmentActions } from '../measurment/measurment.actions';

export interface State extends EntityState<Location> {
  loading: boolean;
  locationsLoadingMeasurments: string[] | number[];
}

export const adapter: EntityAdapter<Location> = createEntityAdapter<Location>();

export const initialState: State = adapter.getInitialState({
  loading: false,
  locationsLoadingMeasurments: [],
});

export function reducer(
  state = initialState,
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
      const loadedState = {
        ...state,
        loading: false,
        locationsLoadingMeasurments: action.payload.locations.map(location => location.id),
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

    case LocationActionTypes.FetchLocationsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case MeasurmentActionTypes.FetchMeasurmentsSuccess: {
      let locationsLoadingMeasurments = state.locationsLoadingMeasurments as string[];
      locationsLoadingMeasurments = locationsLoadingMeasurments.filter(locationID => locationID !== action.payload.location.id);
      return {
        ...state,
        locationsLoadingMeasurments
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
