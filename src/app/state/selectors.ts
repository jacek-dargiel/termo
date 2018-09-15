import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLocation from './location/location.reducer';
import * as fromMeasurment from './measurment/measurment.reducer';
import { Dictionary } from '@ngrx/entity/src/models';
import { Measurment } from './measurment/measurment.model';
import { isAfter, subHours } from 'date-fns/esm';
import { LocationWithKeyMeasurmentValues, Location } from './location/location.model';
import { mapToObject } from '../helpers/utils';

import mapValues from 'lodash/fp/mapValues';
import groupBy from 'lodash/fp/groupBy';
import sortBy from 'lodash/fp/sortBy';

let mapValuesWithKey = mapValues.convert({ cap: false });

export let selectLocationState = createFeatureSelector<fromLocation.State>('location');
export let selectMeasurmentState = createFeatureSelector<fromMeasurment.State>('measurment');

export let selectSelectedLocationID = createSelector(
  selectLocationState,
  location => location.selected
);

export let selectLocationLoading = createSelector(
  selectLocationState,
  location => location.loading
);

export let selectAllLocations = createSelector(
  selectLocationState,
  fromLocation.selectAll,
);

export let selectLocationIds = createSelector(
  selectLocationState,
  fromLocation.selectIds,
);

export let selectLocationEntities = createSelector(
  selectLocationState,
  fromLocation.selectEntities,
);

export let selectSelectedLocation = createSelector(
  selectSelectedLocationID,
  selectLocationEntities,
  (id, locationEntities) => {
    return locationEntities[id];
  }
);

export let selectAllMeasurments = createSelector(
  selectMeasurmentState,
  fromMeasurment.selectAll
);

export let selectMeasurmentEntities = createSelector(
  selectMeasurmentState,
  fromMeasurment.selectEntities,
);

export let selectMeasurmentsLoading = createSelector(
  selectMeasurmentState,
  state => state.loading,
);

export let selectMeasurmentsByLocation = createSelector(
  selectLocationIds,
  selectAllMeasurments,
  (locationIDs: string[], measurments): Dictionary<Measurment[]> => {
    let grouped: Dictionary<Measurment[]> = groupBy('feed_key', measurments);
    return mapToObject<Measurment[]>(
      locationID => grouped[locationID] || [],
      locationIDs,
    );
  }
);

export let selectSelectedLocationMeasurments = createSelector(
  selectSelectedLocationID,
  selectMeasurmentsByLocation,
  (id, measurments) => measurments[id],
);

let selectLatestMeasurmentIdsByLocation = createSelector(
  selectLocationState,
  locationState => locationState.latestMeasurmentIDs,
);

export let selectLastMeasurmentsByLocation = createSelector(
  selectLocationIds,
  selectLatestMeasurmentIdsByLocation,
  selectMeasurmentEntities,
  (locationIDs, latestMeasurmentIDs, measurmentEntities): Dictionary<Measurment> => {
    return mapToObject(
      locationID => measurmentEntities[latestMeasurmentIDs[locationID]],
      locationIDs
    );
  }
);

// export let selectLastMeasurmentsByLocation = createSelector(
//   selectMeasurmentsByLocation,
//   (measurmentsByLocation): Dictionary<Measurment> => {
//     return mapToObject(
//       (locationID: string) => last(measurmentsByLocation[locationID]),
//       keys(measurmentsByLocation)
//     );
//   }
// );

function isMeasurmentInMinimumRange(measurment: Measurment): boolean {
  return isAfter(measurment.created_at, subHours(new Date(), 12));
}

export let selectMeasurmentsFromMinimumRangeByLocation = createSelector(
  selectMeasurmentsByLocation,
  (measurmentsByLocation): Dictionary<Measurment[]> => {
    return mapValuesWithKey(
      (measurments: Measurment[], locationID: string) => measurmentsByLocation[locationID].filter(isMeasurmentInMinimumRange),
      measurmentsByLocation,
    );
  }
);

export let selectMinimalMeasurmentsByLocation = createSelector(
  selectMeasurmentsFromMinimumRangeByLocation,
  (todaysMeasurmentsByLocation): Dictionary<Measurment> => {
    return mapValuesWithKey(
      (measurments: Measurment[], locationID: string) => {
        let sorted: Measurment[] = sortBy('value', todaysMeasurmentsByLocation[locationID]);
        return sorted[0];
      },
      todaysMeasurmentsByLocation,
    );
  }
);

export let selectLocationsMappedWithKeyMeasurmentValues = createSelector(
  selectAllLocations,
  selectLastMeasurmentsByLocation,
  selectMinimalMeasurmentsByLocation,
  (locations, lastMeasurmentsByLocation, minimalMeasurmentsByLocation): LocationWithKeyMeasurmentValues[]  => {
    return locations.map(location => mapLocationWithKeyMeasurmentValues(location, lastMeasurmentsByLocation, minimalMeasurmentsByLocation));
  }
);

export let selectIdsOfLocationsLoadingMeasurments = createSelector(
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
