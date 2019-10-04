import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Location } from './location.model';
import { LocationActions, LocationActionTypes } from './location.actions';
import { MeasurmentActionTypes, MeasurmentActions } from '../measurment/measurment.actions';
import { Measurment } from '../measurment/measurment.model';
import { compareAsc } from 'date-fns/esm';
import { Dictionary } from '@ngrx/entity/src/models';
import { last } from '../../helpers/lodash';

export interface State extends EntityState<Location> {
  loading: boolean;
  locationsLoadingMeasurments: Set<string>;
  latestMeasurmentIDs: Dictionary<string>;
  selected: string;
}

export let adapter: EntityAdapter<Location> = createEntityAdapter<Location>();

export const INITIAL_STATE: State = adapter.getInitialState({
  loading: false,
  locationsLoadingMeasurments: new Set(),
  latestMeasurmentIDs: {},
  selected: undefined,
});

export function reducer(
  state = INITIAL_STATE,
  action: LocationActions | MeasurmentActions
): State {
  switch (action.type) {

    case LocationActionTypes.FetchLocationsSuccess: {
      let locationsLoadingMeasurments = state.locationsLoadingMeasurments;
      for (let location of action.payload.locations) {
        if (!locationsLoadingMeasurments.has(location.id)) {
          locationsLoadingMeasurments.add(location.id);
        }
      }
      let loadedState = {
        ...state,
        loading: false,
        locationsLoadingMeasurments,
      };
      return adapter.addAll(action.payload.locations, loadedState);
    }

    case LocationActionTypes.MapInitialized: {
      return {
        ...state,
        loading: true,
      };
    }

    case LocationActionTypes.RefreshMeasurmentsOnBtnClick:
    case LocationActionTypes.RefreshMeasurmentsOnLocationsLoaded:
    {
      let locationsLoadingMeasurments = state.locationsLoadingMeasurments;
      if (!state.locationsLoadingMeasurments.has(action.payload.locationId)) {
        locationsLoadingMeasurments = new Set(state.locationsLoadingMeasurments);
        locationsLoadingMeasurments.add(action.payload.locationId);
      }
      return {
        ...state,
        locationsLoadingMeasurments,
      };
    }

    case MeasurmentActionTypes.FetchMeasurmentsError: {
      let locationsLoadingMeasurments = new Set(state.locationsLoadingMeasurments);
      locationsLoadingMeasurments.delete(action.payload.locationId);
      return {
        ...state,
        locationsLoadingMeasurments,
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
        locationsState = adapter.updateOne({id: action.payload.locationId, changes: { updatedAt: latestMeasurment.created_at }}, state);
        locationsState = {
          ...locationsState,
          latestMeasurmentIDs: {
            ...locationsState.latestMeasurmentIDs,
            [action.payload.locationId]: latestMeasurment.id,
          }
        };
      }

      let locationsLoadingMeasurments = new Set(state.locationsLoadingMeasurments);
      locationsLoadingMeasurments.delete(action.payload.locationId);
      return {
        ...locationsState,
        locationsLoadingMeasurments,
      };
    }

    case LocationActionTypes.SelectLocation: {
      return {
        ...state,
        selected: action.payload.location && action.payload.location.id,
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
