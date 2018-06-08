import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLocation from './location/location.reducer';
import * as fromMeasurment from './measurment/measurment.reducer';
import { Dictionary } from '@ngrx/entity/src/models';
import { Measurment } from './measurment/measurment.model';
import { isAfter, subDays } from 'date-fns/esm';
import { LocationWithKeyMeasurmentValues, Location } from './location/location.model';
import { mapToObject } from '../helpers/utils';

import { keys, last } from 'lodash/fp';

export const selectLocationState = createFeatureSelector<fromLocation.State>('location');
export const selectMeasurmentState = createFeatureSelector<fromMeasurment.State>('measurment');

export const selectLocationLoading = createSelector(
  selectLocationState,
  location => location.loading
);

export const selectAllLocations = createSelector(
  selectLocationState,
  fromLocation.selectAll,
);

export const selectLocationIds = createSelector(
  selectLocationState,
  fromLocation.selectIds,
);

// export const selectLocationEntities = createSelector(
//   selectLocationState,
//   fromLocation.selectEntities,
// );

export const selectAllMeasurments = createSelector(
  selectMeasurmentState,
  fromMeasurment.selectAll
);

export const selectMeasurmentsByLocation = createSelector(
  selectLocationIds,
  selectAllMeasurments,
  (locationIDs: string[], measurments): Dictionary<Measurment[]> => {
    return mapToObject<Measurment[]>(
      (locationID: string) => measurments.filter(measurment => measurment.feed_key === locationID),
      locationIDs,
    );
  }
);

export const selectLastMeasurmentsByLocation = createSelector(
  selectMeasurmentsByLocation,
  (measurmentsByLocation): Dictionary<Measurment> => {
    return mapToObject(
      (locationID: string) => last(measurmentsByLocation[locationID]),
      keys(measurmentsByLocation)
    );
  }
);

function isMeasurmentAfterToday(measurment: Measurment): boolean {
  return isAfter(measurment.created_at, subDays(new Date(), 1));
}

export const selectTodaysMeasurmentsByLocation = createSelector(
  selectMeasurmentsByLocation,
  (measurmentsByLocation): Dictionary<Measurment[]> => {
    return mapToObject(
      (locationID: string) => measurmentsByLocation[locationID].filter(isMeasurmentAfterToday),
      keys(measurmentsByLocation),
    );
  }
);

export const selectMinimalMeasurmentsByLocation = createSelector(
  selectTodaysMeasurmentsByLocation,
  (todaysMeasurmentsByLocation): Dictionary<Measurment> => {
    return mapToObject(
      (locationID: string) => {
        const toSort = [...todaysMeasurmentsByLocation[locationID]];
        const sorted = toSort.sort((a, b) => (a.value - b.value));
        return sorted[0] || null;
      },
      keys(todaysMeasurmentsByLocation),
    );
  }
);

export const selectLocationsMappedWithKeyMeasurmentValues = createSelector(
  selectAllLocations,
  selectLastMeasurmentsByLocation,
  selectMinimalMeasurmentsByLocation,
  (locations, lastMeasurmentsByLocation, minimalMeasurmentsByLocation): LocationWithKeyMeasurmentValues[]  => {
    return locations.map(location => mapLocationWithKeyMeasurmentValues(location, lastMeasurmentsByLocation, minimalMeasurmentsByLocation));
  }
);

export const selectIdsOfLocationsLoadingMeasurments = createSelector(
  selectLocationState,
  locationState => locationState.locationsLoadingMeasurments,
);

function mapLocationWithKeyMeasurmentValues(
  location: Location,
  lastMeasurmentsByLocation: Dictionary<Measurment>,
  minimalMeasurmentsByLocation: Dictionary<Measurment>,
): LocationWithKeyMeasurmentValues {
  return {
    ...location,
    lastMeasurmentValue: lastMeasurmentsByLocation[location.id] ? lastMeasurmentsByLocation[location.id].value : null,
    minimalMeasurmentValue: minimalMeasurmentsByLocation[location.id] ? minimalMeasurmentsByLocation[location.id].value : null,
  };
}
