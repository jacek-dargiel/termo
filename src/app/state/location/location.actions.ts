import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Location } from './location.model';

export enum LocationActionTypes {
  AddLocation = '[Location] Add Location',
  UpsertLocation = '[Location] Upsert Location',
  AddLocations = '[Location] Add Locations',
  UpsertLocations = '[Location] Upsert Locations',
  UpdateLocation = '[Location] Update Location',
  UpdateLocations = '[Location] Update Locations',
  DeleteLocation = '[Location] Delete Location',
  DeleteLocations = '[Location] Delete Locations',
  ClearLocations = '[Location] Clear Locations',

  MapInitialized = '[Map] Map Initialized',
  RefreshMeasurmentsStart = '[Effect] Refresh Measurments Start',
  RefreshMeasurmentsFinish = '[Effect] Refresh Measurments Finish',
  FetchLocationsSuccess = '[API] Fetch Locations Success',
  FetchLocationsError = '[API] Fetch Locations Error',
}

export class FetchLocationsSuccess implements Action {
  readonly type = LocationActionTypes.FetchLocationsSuccess;

  constructor(public payload: { locations: Location[] }) {}
}

export class AddLocation implements Action {
  readonly type = LocationActionTypes.AddLocation;

  constructor(public payload: { location: Location }) {}
}

export class UpsertLocation implements Action {
  readonly type = LocationActionTypes.UpsertLocation;

  constructor(public payload: { location: Location }) {}
}

export class AddLocations implements Action {
  readonly type = LocationActionTypes.AddLocations;

  constructor(public payload: { locations: Location[] }) {}
}

export class UpsertLocations implements Action {
  readonly type = LocationActionTypes.UpsertLocations;

  constructor(public payload: { locations: Location[] }) {}
}

export class UpdateLocation implements Action {
  readonly type = LocationActionTypes.UpdateLocation;

  constructor(public payload: { location: Update<Location> }) {}
}

export class UpdateLocations implements Action {
  readonly type = LocationActionTypes.UpdateLocations;

  constructor(public payload: { locations: Update<Location>[] }) {}
}

export class DeleteLocation implements Action {
  readonly type = LocationActionTypes.DeleteLocation;

  constructor(public payload: { id: string }) {}
}

export class DeleteLocations implements Action {
  readonly type = LocationActionTypes.DeleteLocations;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearLocations implements Action {
  readonly type = LocationActionTypes.ClearLocations;
}

// ### Custom actions

export class MapInitialized implements Action {
  readonly type = LocationActionTypes.MapInitialized;
}

export class RefreshMeasurmentsStart implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsStart;
  constructor(public payload: { locations: Location[] }) {}
}

export class RefreshMeasurmentsFinish implements Action {
  readonly type = LocationActionTypes.RefreshMeasurmentsFinish;
}

export class FetchLocationsError implements Action {
  readonly type = LocationActionTypes.FetchLocationsError;
  constructor(public payload: { error: Error }) {}
}

export type LocationActions =
 FetchLocationsSuccess
 | AddLocation
 | UpsertLocation
 | AddLocations
 | UpsertLocations
 | UpdateLocation
 | UpdateLocations
 | DeleteLocation
 | DeleteLocations
 | ClearLocations
 | MapInitialized
 | RefreshMeasurmentsStart
 | RefreshMeasurmentsFinish
 | FetchLocationsError
 ;
