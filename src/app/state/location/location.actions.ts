import { Action } from '@ngrx/store';
import { Location } from './location.model';

export enum LocationActionTypes {
  MapInitialized = '[Map] Map Initialized',
  MQTTConnected = '[MQTT] Connected',
  RefreshMeasurmentsOnBtnClick = '[Effect] Refresh Measurments On Button Click',
  RefreshMeasurmentsOnLocationsLoaded = '[Effect] Refresh Measurments On Locations Loaded',
  RefreshButtonClick = '[Header] Refresh button clicked',
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

export class RefreshMeasurmentsOnBtnClick implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsOnBtnClick;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshMeasurmentsOnLocationsLoaded implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsOnLocationsLoaded;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshButtonClick implements Action {
  readonly type = LocationActionTypes.RefreshButtonClick;
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
 | RefreshMeasurmentsOnBtnClick
 | RefreshMeasurmentsOnLocationsLoaded
 | RefreshButtonClick
 | FetchLocationsError
 | SelectLocation
 ;
