import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLocation from './location/location.reducer';

export const selectLocationState = createFeatureSelector<fromLocation.State>('location');

export const selectLocationLoading = createSelector(
  selectLocationState,
  location => location.loading
);

export const selectAllLocations = createSelector(
  selectLocationState,
  fromLocation.selectAll,
);
