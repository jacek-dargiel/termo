import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  FetchLocationsSuccess,
  LocationActionTypes,
  FetchLocationsError,
  RefreshMeasurmentsStart,
  RefreshMeasurmentsFinish,
} from './state/location/location.actions';
import { LocationService } from './services/location.service';
import {
  map,
  switchMap,
  catchError,
  mergeMap,
  mergeAll,
  filter,
  tap,
  concat,
  first
} from 'rxjs/operators';
import { ErrorHandlingService } from './services/error-handling.service';
import { MeasurmentService } from './services/measurment.service';
import {
  MeasurmentActionTypes,
  FetchMeasurmentsError,
  FetchMeasurmentsSuccess,
} from './state/measurment/measurment.actions';
import { subDays } from 'date-fns/esm';
import { RefreshCounterService } from './services/refresh-counter.service';
import { State } from './state/reducers';
import { Store } from '@ngrx/store';
import { selectAllLocations } from './state/selectors';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private location: LocationService,
    private measurment: MeasurmentService,
    private refreshCounter: RefreshCounterService,
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
    catchError(() => {
      let readableError = new Error('Nie udało się pobrać listy tuneli.');
      return of(new FetchLocationsError({error: readableError}));
    })
  );

  @Effect()
  refreshMeasurmentsStart$ = this.actions$.pipe(
    ofType(LocationActionTypes.FetchLocationsSuccess),
    map((action: FetchLocationsSuccess) => action.payload.locations),
    map(locations => new RefreshMeasurmentsStart({ locations })),
  );

  @Effect()
  refreshMeasurments$ = this.actions$.pipe(
    ofType<RefreshMeasurmentsStart>(LocationActionTypes.RefreshMeasurmentsStart),
    map(action => action.payload.locations),
    switchMap(locations => {
      return of(locations).pipe(
        mergeAll(),
        mergeMap(location => {
          const start = subDays(new Date(), 1);
          return this.measurment.getMeasurments(location.id, start).pipe(
            map(measurments => ({ measurments, location }))
          );
        }),
        map(({ measurments, location }) => new FetchMeasurmentsSuccess({ measurments, location })),
        catchError(error => {
          let readableError = new Error('Nie udało się pobrać najnowszych pomiarów temperatury.');
          return of(new FetchMeasurmentsError({ error: readableError }));
        }),
        concat(of(new RefreshMeasurmentsFinish())),
      );
    }),
  );

  @Effect()
  timerRefresh$ = this.actions$.pipe(
    ofType(LocationActionTypes.RefreshMeasurmentsFinish),
    tap(() => this.refreshCounter.restart()),
    switchMap(() => this.refreshCounter.timer),
    filter(countdownValue => countdownValue === 0),
    switchMap(() => {
      return this.store.select(selectAllLocations).pipe(
        first(),
      );
    }),
    map(locations => new RefreshMeasurmentsStart({locations}))
  );
}
