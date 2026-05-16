import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLocation from './location/location.reducer';
import * as fromMeasurement from './measurement/measurement.reducer';
import { Dictionary } from '@ngrx/entity';
import { Measurement } from './measurement/measurement.model';
import { isAfter, subHours } from 'date-fns';
import { LocationWithKeyMeasurementValues, Location } from './location/location.model';
import { mapToObject, mapValuesWithKey } from '../helpers/utils';

export let selectLocationState = createFeatureSelector<fromLocation.State>('location');
export let selectMeasurementState = createFeatureSelector<fromMeasurement.State>('measurement');

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

export let selectAllMeasurements = createSelector(
  selectMeasurementState,
  fromMeasurement.selectAll
);

export let selectMeasurementEntities = createSelector(
  selectMeasurementState,
  fromMeasurement.selectEntities,
);

export let selectMeasurementsLoading = createSelector(
  selectMeasurementState,
  state => state.loading,
);

export let selectMeasurementsByLocation = createSelector(
  selectLocationIds,
  selectAllMeasurements,
  (locationIDs: string[], measurements): Dictionary<Measurement[]> => {
    let grouped: Dictionary<Measurement[]> = Object.groupBy(measurements, measurement => measurement.feed_key);
    return mapToObject<Measurement[]>(
      locationIDs,
      locationID => grouped[locationID] || [],
    );
  }
);

export let selectSelectedLocationMeasurements = createSelector(
  selectSelectedLocationID,
  selectMeasurementsByLocation,
  (id, measurements) => measurements[id],
);

let selectLatestMeasurementIdsByLocation = createSelector(
  selectLocationState,
  locationState => locationState.latestMeasurementIDs,
);

export let selectLastMeasurementsByLocation = createSelector(
  selectLocationIds,
  selectLatestMeasurementIdsByLocation,
  selectMeasurementEntities,
  (locationIDs, latestMeasurementIDs, measurementEntities): Dictionary<Measurement> => {
    return mapToObject(
      locationIDs,
      locationID => measurementEntities[latestMeasurementIDs[locationID]],
    );
  }
);

// export let selectLastMeasurementsByLocation = createSelector(
//   selectMeasurementsByLocation,
//   (measurementsByLocation): Dictionary<Measurement> => {
//     return mapToObject(
//       (locationID: string) => last(measurementsByLocation[locationID]),
//       keys(measurementsByLocation)
//     );
//   }
// );

function isMeasurementInMinimumRange(measurement: Measurement): boolean {
  return isAfter(measurement.created_at, subHours(new Date(), 12));
}

export let selectMeasurementsFromMinimumRangeByLocation = createSelector(
  selectMeasurementsByLocation,
  (measurementsByLocation): Dictionary<Measurement[]> => {
    return mapValuesWithKey(
      measurementsByLocation,
      (measurements: Measurement[], locationID: string) => measurementsByLocation[locationID].filter(isMeasurementInMinimumRange),
    );
  }
);

export let selectMinimalMeasurementsByLocation = createSelector(
  selectMeasurementsFromMinimumRangeByLocation,
  (todaysMeasurementsByLocation): Dictionary<Measurement> => {
    return mapValuesWithKey(
      todaysMeasurementsByLocation,
      (measurements: Measurement[], locationID: string) => {
        let sorted: Measurement[] = todaysMeasurementsByLocation[locationID].toSorted((a, b) => a.value - b.value);
        return sorted[0];
      },
    );
  }
);

export let selectLocationsMappedWithKeyMeasurementValues = createSelector(
  selectAllLocations,
  selectLastMeasurementsByLocation,
  selectMinimalMeasurementsByLocation,
  (locations, lastMeasurementsByLocation, minimalMeasurementsByLocation): LocationWithKeyMeasurementValues[]  => {
    return locations.map(location => mapLocationWithKeyMeasurementValues(location, lastMeasurementsByLocation, minimalMeasurementsByLocation));
  }
);

function mapLocationWithKeyMeasurementValues(
  location: Location,
  lastMeasurementsByLocation: Dictionary<Measurement>,
  minimalMeasurementsByLocation: Dictionary<Measurement>,
): LocationWithKeyMeasurementValues {
  return {
    ...location,
    lastMeasurementValue: lastMeasurementsByLocation[location.id] ? lastMeasurementsByLocation[location.id].value : null,
    minimalMeasurementValue: minimalMeasurementsByLocation[location.id] ? minimalMeasurementsByLocation[location.id].value : null,
  };
}
