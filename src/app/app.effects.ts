import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { defer, Observable, of } from 'rxjs';
import { FetchLocationsSuccess, LocationActionTypes, FetchLocationsError } from './state/location/location.actions';
import { LocationService } from './services/location.service';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './services/error-handling.service';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private location: LocationService,
    private errorHandling: ErrorHandlingService,
  ) {}

  @Effect({dispatch: false})
  ajaxError$ = this.actions$.pipe(
    ofType(
      LocationActionTypes.FetchLocationsError,
    ),
    map((action: FetchLocationsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect()
  loadLocations$ = this.actions$.pipe(
    ofType(LocationActionTypes.MapInitialized),
    switchMap(() => this.location.getLocations()),
    map(locations => new FetchLocationsSuccess({locations})),
    catchError(error => of(new FetchLocationsError(error)))
  );
}
