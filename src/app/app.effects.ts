import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { subDays } from 'date-fns';

import { LocationService } from './services/location.service';
import { MeasurementService } from './services/measurement.service';
import { ErrorHandlingService } from './services/error-handling.service';

import { of, from } from 'rxjs';
import {
  map,
  switchMap,
  catchError,
  mergeMap,
  throttleTime,
  tap,
  concatWith,
} from 'rxjs/operators';

import * as locationActions from './state/location/location.actions';
import * as measurementActions from './state/measurement/measurement.actions';
import { selectLocationIds, } from './state/selectors';
import { State } from './state/reducers';

import { environment } from 'environments/environment';
import { RefreshSignalService } from './services/refresh-signal.service';


@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<State>>(Store);
  private location = inject(LocationService);
  private measurement = inject(MeasurementService);
  private errorHandling = inject(ErrorHandlingService);
  private refreshSignal = inject(RefreshSignalService);


  genericAjaxErrors$ = createEffect(() => this.actions$.pipe(
    ofType(
      locationActions.LocationActionTypes.FetchLocationsError,
    ),
    map((action: locationActions.FetchLocationsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  ), {dispatch: false});

  fetchMeasurementsErrors$ = createEffect(() => this.actions$.pipe(
    ofType(measurementActions.MeasurementActionTypes.FetchMeasurementsError),
    throttleTime(environment.snackbarDefaultTimeout),
    map((action: measurementActions.FetchMeasurementsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  ), {dispatch: false});

  loadLocations$ = createEffect(() => this.actions$.pipe(
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
  ));

  refreshOnLocationsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType<locationActions.FetchLocationsSuccess>(locationActions.LocationActionTypes.FetchLocationsSuccess),
    switchMap(action => from(action.payload.locations)),
    map(location => new locationActions.RefreshMeasurementsOnLocationsLoaded({locationId: location.id})),
  ));


  refreshOnButtonClick$ = createEffect(() => this.actions$.pipe(
    ofType<locationActions.RefreshButtonClick>(locationActions.LocationActionTypes.RefreshButtonClick),
    switchMap(() => this.store.select(selectLocationIds)),
    switchMap((ids: string[]) => from(ids)),
    map(locationId => new locationActions.RefreshMeasurementsOnBtnClick({locationId})),
  ));

  refreshMeasurements$ = createEffect(() => this.actions$.pipe(
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
            return this.measurement.getMeasurements(locationId, start)
              .pipe(
                map((measurements) => new measurementActions.FetchMeasurementsSuccess({ measurements, locationId })),
                catchError(error => {
                  console.error(error);
                  let readableError = new Error('Nie udało się pobrać najnowszych pomiarów temperatury.');
                  return of(new measurementActions.FetchMeasurementsError({ error: readableError, locationId }));
                }),
              );
          }),
          concatWith(of(new locationActions.RefreshMeasurementsFinished())),
        );
    }),
  ));

  resetSignalOnMeasurementsFinished$ = createEffect(() => this.actions$.pipe(
    ofType<locationActions.RefreshMeasurementsFinished>(locationActions.LocationActionTypes.RefreshMeasurementsFinished),
    tap(() => this.refreshSignal.restart()),
    switchMap(() =>this.refreshSignal.signal),
    map(() => new locationActions.RefreshSignal()),
  ));

}
