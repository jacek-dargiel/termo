import { Action } from '@ngrx/store';
import { Measurment } from './measurment.model';
import { Location } from '../location/location.model';

export enum MeasurmentActionTypes {

  FetchMeasurments = '[Map] Fetch Measurments',
  FetchMeasurmentsSuccess = '[API] Fetch Measurments Success',
  FetchMeasurmentsError = '[API] Fetch Measurments Error',
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
 FetchMeasurments
 | FetchMeasurmentsSuccess
 | FetchMeasurmentsError
;
