import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Location } from './location.model';
import { LocationActions, LocationActionTypes } from './location.actions';

export interface State extends EntityState<Location> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Location> = createEntityAdapter<Location>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: LocationActions
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

    case LocationActionTypes.LoadLocations: {
      return adapter.addAll(action.payload.locations, state);
    }

    case LocationActionTypes.ClearLocations: {
      return adapter.removeAll(state);
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
