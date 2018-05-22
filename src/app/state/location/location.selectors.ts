import * as fromLocation from './location.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectLocationState = createFeatureSelector<fromLocation.State>('location');

export const selectLoading = createSelector(
  selectLocationState,
  location => location.loading
);

export const selectAllLocations = createSelector(
  selectLocationState,
  fromLocation.selectAll,
);
