import { Action } from '@ngrx/store';
import { Location } from './location.model';

export enum LocationActionTypes {
  MapInitialized = '[Map] Map Initialized',
  RefreshMeasurmentsStart = '[Effect] Refresh Measurments Start',
  RefreshMeasurmentsFinish = '[Effect] Refresh Measurments Finish',
  FetchLocationsSuccess = '[API] Fetch Locations Success',
  FetchLocationsError = '[API] Fetch Locations Error',

  SelectLocation = '[Map] Select Location',
}

export class FetchLocationsSuccess implements Action {
  readonly type = LocationActionTypes.FetchLocationsSuccess;

  constructor(public payload: { locations: Location[] }) {}
}

// ### Custom actions

export class MapInitialized implements Action {
  readonly type = LocationActionTypes.MapInitialized;
}

export class RefreshMeasurmentsStart implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsStart;
  constructor(public payload: { location: Location }) {}
}

export class RefreshMeasurmentsFinish implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsFinish;
}

export class FetchLocationsError implements Action {
  readonly type = LocationActionTypes.FetchLocationsError;
  constructor(public payload: { error: Error }) {}
}

export class SelectLocation implements Action {
  readonly type = LocationActionTypes.SelectLocation;
  constructor(public payload: { location: Location }) {}
}

export type LocationActions =
 FetchLocationsSuccess
 | MapInitialized
 | RefreshMeasurmentsStart
 | RefreshMeasurmentsFinish
 | FetchLocationsError
 | SelectLocation
 ;
