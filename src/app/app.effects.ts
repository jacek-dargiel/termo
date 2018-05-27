import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { FetchLocationsSuccess, LocationActionTypes, FetchLocationsError } from './state/location/location.actions';
import { LocationService } from './services/location.service';
import { map, switchMap, catchError, mergeMap, mergeAll } from 'rxjs/operators';
import { ErrorHandlingService } from './services/error-handling.service';
import { MeasurmentService } from './services/measurment.service';
import { LoadMeasurments, MeasurmentActionTypes, FetchMeasurmentsError } from './state/measurment/measurment.actions';
import { subDays } from 'date-fns/esm';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private location: LocationService,
    private measurment: MeasurmentService,
    private errorHandling: ErrorHandlingService,
  ) {}

  @Effect({dispatch: false})
  ajaxError$ = this.actions$.pipe(
    ofType(
      LocationActionTypes.FetchLocationsError,
      MeasurmentActionTypes.FetchMeasurmentsError
    ),
    map((action: FetchLocationsError | FetchMeasurmentsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect()
  loadLocations$ = this.actions$.pipe(
    ofType(LocationActionTypes.MapInitialized),
    switchMap(() => this.location.getLocations()),
    map(locations => new FetchLocationsSuccess({locations})),
    catchError(error => of(new FetchLocationsError(error)))
  );

  @Effect()
  loadMeasurments$ = this.actions$.pipe(
    ofType(LocationActionTypes.FetchLocationsSuccess),                      // => Observable<FetchLocationSuccess>
    map((action: FetchLocationsSuccess) => action.payload.locations),       // => Observable<Location[]>
    mergeAll(),                                                             // => Observable<Location>
    mergeMap(location => {
      const start = subDays(new Date(), 1);
      return this.measurment.getMeasurments(location.id, start);
    }),                                                                     // => Observable<Measurment[]>
    map(measurments => new LoadMeasurments({measurments})),                 // => Observable<LoadMeasurments>
    catchError(error => of(new FetchMeasurmentsError(error))),
  );
}
