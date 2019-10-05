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
  latestMeasurmentIDs: Dictionary<string>;
  selected: string;
}

function locationPositionComparer(a: Location, b: Location) {
  let aOffset = a.mapPosition.x + a.mapPosition.y;
  let bOffset = b.mapPosition.x + b.mapPosition.y;

  return aOffset - bOffset;
}

export let adapter: EntityAdapter<Location> = createEntityAdapter<Location>({
  sortComparer: locationPositionComparer,
});

export const INITIAL_STATE: State = adapter.getInitialState({
  loading: false,
  latestMeasurmentIDs: {},
  selected: undefined,
});

export function reducer(
  state = INITIAL_STATE,
  action: LocationActions | MeasurmentActions
): State {
  switch (action.type) {

    case LocationActionTypes.FetchLocationsSuccess: {
      let loadedState = {
        ...state,
      };
      return adapter.addAll(action.payload.locations, loadedState);
    }

    case LocationActionTypes.MapInitialized: {
      return {
        ...state,
        loading: true,
      };
    }

    case LocationActionTypes.RefreshButtonClick:
    case LocationActionTypes.FetchLocationsSuccess:
    case LocationActionTypes.RefreshSignal:
    {
      return {
        ...state,
        loading: true,
      };
    }

    case MeasurmentActionTypes.FetchMeasurmentsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case LocationActionTypes.FetchLocationsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case LocationActionTypes.RefreshMeasurmentsFinished: {
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

      return {
        ...locationsState,
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
