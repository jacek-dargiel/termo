import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Location } from './location.model';
import { LocationActions, LocationActionTypes } from './location.actions';
import { MeasurementActionTypes, MeasurementActions } from '../measurement/measurement.actions';
import { Measurement } from '../measurement/measurement.model';
import { compareAsc } from 'date-fns';
import { Dictionary } from '@ngrx/entity';

export interface State extends EntityState<Location> {
  loading: boolean;
  latestMeasurementIDs: Dictionary<string>;
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
  latestMeasurementIDs: {},
  selected: undefined,
});

export function reducer(
  state = INITIAL_STATE,
  action: LocationActions | MeasurementActions
): State {
  switch (action.type) {

    case LocationActionTypes.FetchLocationsSuccess: {
      let loadedState = {
        ...state,
      };
      return adapter.setAll(action.payload.locations, loadedState);
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

    case MeasurementActionTypes.FetchMeasurementsError: {
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

    case LocationActionTypes.RefreshMeasurementsFinished: {
      return {
        ...state,
        loading: false,
      };
    }

    case MeasurementActionTypes.FetchMeasurementsSuccess: {
      let locationsState = state;
      if (action.payload.measurements.length > 0) {
        let sortedMeasurements = sortMeasurements(action.payload.measurements);
        // let latestMeasurement = last(sortedMeasurements);
        let latestMeasurement = sortedMeasurements.at(-1);
        locationsState = adapter.updateOne({id: action.payload.locationId, changes: { updatedAt: latestMeasurement.created_at }}, state);
        locationsState = {
          ...locationsState,
          latestMeasurementIDs: {
            ...locationsState.latestMeasurementIDs,
            [action.payload.locationId]: latestMeasurement.id,
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

function sortMeasurements(measurements: Measurement[]) {
  return measurements.toSorted((a: Measurement, b: Measurement) => compareAsc(a.created_at, b.created_at));
}
