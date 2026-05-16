import { Action } from '@ngrx/store';
import { Location } from './location.model';

export enum LocationActionTypes {
  MapInitialized = '[Map] Map Initialized',
  MQTTConnected = '[MQTT] Connected',
  RefreshMeasurementsOnBtnClick = '[Effect] Refresh Measurements On Button Click',
  RefreshMeasurementsOnLocationsLoaded = '[Effect] Refresh Measurements On Locations Loaded',
  RefreshButtonClick = '[Header] Refresh button clicked',
  RefreshSignal = '[Effect] Refresh Signal',

  RefreshMeasurementsFinished = '[Effect] Refresh Measurements finished',

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

export class RefreshMeasurementsOnBtnClick implements Action {
  readonly type = LocationActionTypes.RefreshMeasurementsOnBtnClick;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshMeasurementsOnLocationsLoaded implements Action {
  readonly type = LocationActionTypes.RefreshMeasurementsOnLocationsLoaded;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshButtonClick implements Action {
  readonly type = LocationActionTypes.RefreshButtonClick;
}

export class RefreshSignal implements Action {
  readonly type = LocationActionTypes.RefreshSignal;
}

export class RefreshMeasurementsFinished implements Action {
  readonly type = LocationActionTypes.RefreshMeasurementsFinished;
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
 | RefreshMeasurementsOnBtnClick
 | RefreshMeasurementsOnLocationsLoaded
 | RefreshButtonClick
 | RefreshMeasurementsFinished
 | RefreshSignal
 | FetchLocationsError
 | SelectLocation
 ;
