import { Action } from '@ngrx/store';
import { Location } from './location.model';

export enum LocationActionTypes {
  MapInitialized = '[Map] Map Initialized',
  MQTTConnected = '[MQTT] Connected',
  RefreshMeasurmentsOnMQTTConnect = '[Effect] Refresh Measurments On MQTT Connect',
  RefreshMeasurmentsOnMQTTMessage = '[Effect] Refresh Measurments On MQTT Message',
  RefreshMeasurmentsOnBtnClick = '[Effect] Refresh Measurments On Button Click',
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

export class MQTTConnected implements Action {
  readonly type = LocationActionTypes.MQTTConnected;
}

export class RefreshMeasurmentsOnMQTTConnect implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsOnMQTTConnect;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshMeasurmentsOnMQTTMessage implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsOnMQTTMessage;
  constructor(public payload: { locationId: string }) {}
}

export class RefreshMeasurmentsOnBtnClick implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsOnBtnClick;
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
 | RefreshMeasurmentsOnMQTTConnect
 | RefreshMeasurmentsOnMQTTMessage
 | RefreshButtonClick
 | FetchLocationsError
 | SelectLocation
 ;
