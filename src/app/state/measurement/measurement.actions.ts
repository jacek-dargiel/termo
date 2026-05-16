import { Action } from '@ngrx/store';
import { Measurement } from './measurement.model';

export enum MeasurementActionTypes {

  FetchMeasurements = '[Map] Fetch Measurements',
  FetchMeasurementsSuccess = '[API] Fetch Measurements Success',
  FetchMeasurementsError = '[API] Fetch Measurements Error',
}

export class FetchMeasurements implements Action {
  readonly type = MeasurementActionTypes.FetchMeasurements;
  constructor(public payload: { locations: number[] }) {}
}

export class FetchMeasurementsSuccess implements Action {
  readonly type = MeasurementActionTypes.FetchMeasurementsSuccess;

  constructor(public payload: { measurements: Measurement[], locationId: string }) {}
}

export class FetchMeasurementsError implements Action {
  readonly type = MeasurementActionTypes.FetchMeasurementsError;
  constructor(public payload: { error: Error, locationId: string }) {}
}

export type MeasurementActions =
 FetchMeasurements
 | FetchMeasurementsSuccess
 | FetchMeasurementsError
;
