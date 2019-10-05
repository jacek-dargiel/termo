import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { subDays } from 'date-fns/esm';

import { LocationService } from './services/location.service';
import { MeasurmentService } from './services/measurment.service';
import { ErrorHandlingService } from './services/error-handling.service';

import { of, from } from 'rxjs';
import {
  map,
  switchMap,
  catchError,
  mergeMap,
  throttleTime,
  switchMapTo,
  concat,
  tap,
  filter,
} from 'rxjs/operators';

import * as locationActions from './state/location/location.actions';
import * as measurmentActions from './state/measurment/measurment.actions';
import { selectLocationIds, } from './state/selectors';
import { State } from './state/reducers';

import { environment } from 'environments/environment';
import { RefreshSignalService } from './services/refresh-signal.service';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private location: LocationService,
    private measurment: MeasurmentService,
    private errorHandling: ErrorHandlingService,
    private refreshSignal: RefreshSignalService,
  ) {}

  @Effect({dispatch: false})
  genericAjaxErrors$ = this.actions$.pipe(
    ofType(
      locationActions.LocationActionTypes.FetchLocationsError,
    ),
    map((action: locationActions.FetchLocationsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect({dispatch: false})
  fetchMeasurmentsErrors$ = this.actions$.pipe(
    ofType(measurmentActions.MeasurmentActionTypes.FetchMeasurmentsError),
    throttleTime(environment.snackbarDefaultTimeout),
    map((action: measurmentActions.FetchMeasurmentsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect()
  loadLocations$ = this.actions$.pipe(
    ofType(locationActions.LocationActionTypes.MapInitialized),
    switchMap(() => this.location.getLocations()
      .pipe(
        map(locations => new locationActions.FetchLocationsSuccess({locations})),
        catchError(error => {
          console.error(error);
          let readableError = new Error('Nie udało się pobrać listy tuneli.');
          return of(new locationActions.FetchLocationsError({error: readableError}));
        })
      )
    ),
  );

  @Effect()
  refreshOnLocationsLoaded$ = this.actions$.pipe(
    ofType<locationActions.FetchLocationsSuccess>(locationActions.LocationActionTypes.FetchLocationsSuccess),
    switchMap(action => from(action.payload.locations)),
    map(location => new locationActions.RefreshMeasurmentsOnLocationsLoaded({locationId: location.id})),
  );


  @Effect()
  refreshOnButtonClick$ = this.actions$.pipe(
    ofType<locationActions.RefreshButtonClick>(locationActions.LocationActionTypes.RefreshButtonClick),
    switchMapTo(this.store.select(selectLocationIds)),
    switchMap((ids: string[]) => from(ids)),
    map(locationId => new locationActions.RefreshMeasurmentsOnBtnClick({locationId})),
  );

  @Effect()
  refreshMeasurments$ = this.actions$.pipe(
    ofType<locationActions.RefreshButtonClick | locationActions.FetchLocationsSuccess | locationActions.RefreshSignal>(
      locationActions.LocationActionTypes.RefreshButtonClick,
      locationActions.LocationActionTypes.FetchLocationsSuccess,
      locationActions.LocationActionTypes.RefreshSignal,
    ),
    switchMap(() => this.store.pipe(select(selectLocationIds))),
    mergeMap(locationIds => {
      let start = subDays(new Date(), 1);
      return from(locationIds)
        .pipe(
          mergeMap((locationId: string) => {
            return this.measurment.getMeasurments(locationId, start)
              .pipe(
                map((measurments) => new measurmentActions.FetchMeasurmentsSuccess({ measurments, locationId })),
                catchError(error => {
                  console.error(error);
                  let readableError = new Error('Nie udało się pobrać najnowszych pomiarów temperatury.');
                  return of(new measurmentActions.FetchMeasurmentsError({ error: readableError, locationId }));
                }),
              );
          }),
          concat(of(new locationActions.RefreshMeasurmentsFinished())),
        );
    }),
    tap(action => console.log(action.type)),
  );

  @Effect()
  resetSignalOnMeasurmentsFinished$ = this.actions$.pipe(
    ofType<locationActions.RefreshMeasurmentsFinished>(locationActions.LocationActionTypes.RefreshMeasurmentsFinished),
    tap(() => this.refreshSignal.restart()),
    switchMapTo(this.refreshSignal.signal),
    filter(countdown => countdown === 0),
    map(() => new locationActions.RefreshSignal()),
  );

}
