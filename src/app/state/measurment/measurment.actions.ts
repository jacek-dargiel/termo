import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Measurment } from './measurment.model';
import { Location } from '../location/location.model';

export enum MeasurmentActionTypes {
  LoadMeasurments = '[Measurment] Load Measurments',
  AddMeasurment = '[Measurment] Add Measurment',
  UpsertMeasurment = '[Measurment] Upsert Measurment',
  AddMeasurments = '[Measurment] Add Measurments',
  UpsertMeasurments = '[Measurment] Upsert Measurments',
  UpdateMeasurment = '[Measurment] Update Measurment',
  UpdateMeasurments = '[Measurment] Update Measurments',
  DeleteMeasurment = '[Measurment] Delete Measurment',
  DeleteMeasurments = '[Measurment] Delete Measurments',
  ClearMeasurments = '[Measurment] Clear Measurments',

  FetchMeasurments = '[Map] Fetch Measurments',
  FetchMeasurmentsSuccess = '[API] Fetch Measurments Success',
  FetchMeasurmentsError = '[API] Fetch Measurments Error',
}

export class LoadMeasurments implements Action {
  readonly type = MeasurmentActionTypes.LoadMeasurments;

  constructor(public payload: { measurments: Measurment[] }) {}
}

export class AddMeasurment implements Action {
  readonly type = MeasurmentActionTypes.AddMeasurment;

  constructor(public payload: { measurment: Measurment }) {}
}

export class UpsertMeasurment implements Action {
  readonly type = MeasurmentActionTypes.UpsertMeasurment;

  constructor(public payload: { measurment: Measurment }) {}
}

export class AddMeasurments implements Action {
  readonly type = MeasurmentActionTypes.AddMeasurments;

  constructor(public payload: { measurments: Measurment[] }) {}
}

export class UpsertMeasurments implements Action {
  readonly type = MeasurmentActionTypes.UpsertMeasurments;

  constructor(public payload: { measurments: Measurment[] }) {}
}

export class UpdateMeasurment implements Action {
  readonly type = MeasurmentActionTypes.UpdateMeasurment;

  constructor(public payload: { measurment: Update<Measurment> }) {}
}

export class UpdateMeasurments implements Action {
  readonly type = MeasurmentActionTypes.UpdateMeasurments;

  constructor(public payload: { measurments: Update<Measurment>[] }) {}
}

export class DeleteMeasurment implements Action {
  readonly type = MeasurmentActionTypes.DeleteMeasurment;

  constructor(public payload: { id: string }) {}
}

export class DeleteMeasurments implements Action {
  readonly type = MeasurmentActionTypes.DeleteMeasurments;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearMeasurments implements Action {
  readonly type = MeasurmentActionTypes.ClearMeasurments;
}

export class FetchMeasurments implements Action {
  readonly type = MeasurmentActionTypes.FetchMeasurments;
  constructor(public payload: { locations: number[] }) {}
}

export class FetchMeasurmentsSuccess implements Action {
  readonly type = MeasurmentActionTypes.FetchMeasurmentsSuccess;

  constructor(public payload: { measurments: Measurment[], location: Location }) {}
}

export class FetchMeasurmentsError implements Action {
  readonly type = MeasurmentActionTypes.FetchMeasurmentsError;
  constructor(public payload: { error: Error, location: Location }) {}
}

export type MeasurmentActions =
 LoadMeasurments
 | AddMeasurment
 | UpsertMeasurment
 | AddMeasurments
 | UpsertMeasurments
 | UpdateMeasurment
 | UpdateMeasurments
 | DeleteMeasurment
 | DeleteMeasurments
 | ClearMeasurments
 | FetchMeasurments
 | FetchMeasurmentsSuccess
 | FetchMeasurmentsError
;
