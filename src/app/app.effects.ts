import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { subDays } from 'date-fns/esm';

import { LocationService } from './services/location.service';
import { MeasurmentService } from './services/measurment.service';
import { MQTTClientService } from './services/mqtt.service';
import { ErrorHandlingService } from './services/error-handling.service';

import { of, from } from 'rxjs';
import {
  map,
  switchMap,
  catchError,
  mergeMap,
  throttleTime,
  switchMapTo,
  filter,
} from 'rxjs/operators';

import {
  FetchLocationsSuccess,
  LocationActionTypes,
  FetchLocationsError,
  MQTTConnected,
  RefreshMeasurmentsOnMQTTConnect,
  RefreshMeasurmentsOnMQTTMessage,
} from './state/location/location.actions';
import {
  MeasurmentActionTypes,
  FetchMeasurmentsError,
  FetchMeasurmentsSuccess,
} from './state/measurment/measurment.actions';
import { selectLocationIds } from './state/selectors';
import { State } from './state/reducers';

import { environment } from 'environments/environment';
import { retryBackoff } from 'backoff-rxjs';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private location: LocationService,
    private measurment: MeasurmentService,
    private mqttClient: MQTTClientService,
    private errorHandling: ErrorHandlingService,
  ) {}

  @Effect({dispatch: false})
  genericAjaxErrors$ = this.actions$.pipe(
    ofType(
      LocationActionTypes.FetchLocationsError,
    ),
    map((action: FetchLocationsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect({dispatch: false})
  fetchMeasurmentsErrors$ = this.actions$.pipe(
    ofType(MeasurmentActionTypes.FetchMeasurmentsError),
    throttleTime(environment.snackbarDefaultTimeout),
    map((action: FetchMeasurmentsError) => action.payload.error),
    map(error => this.errorHandling.handle(error)),
  );

  @Effect()
  loadLocations$ = this.actions$.pipe(
    ofType(LocationActionTypes.MapInitialized),
    switchMap(() => this.location.getLocations()),
    map(locations => new FetchLocationsSuccess({locations})),
    catchError(error => {
      console.error(error);
      let readableError = new Error('Nie udało się pobrać listy tuneli.');
      return of(new FetchLocationsError({error: readableError}));
    })
  );

  @Effect()
  connectMQTT$ = this.actions$.pipe(
    ofType<FetchLocationsSuccess>(LocationActionTypes.FetchLocationsSuccess),
    switchMap(locations => {
      return this.mqttClient.notifications$.pipe(
        filter(notification => notification.type === 'CONNECT_SUCCESS')
      );
    }),
    map(() => new MQTTConnected())
  );

  @Effect({dispatch: false})
  subscribeFeeds$ = this.actions$.pipe(
    ofType<MQTTConnected>(LocationActionTypes.MQTTConnected),
    switchMapTo(this.store.select(selectLocationIds)),
    switchMap((ids: string[]) => from(ids)),
    switchMap(locationId => this.mqttClient.subscribeFeed(locationId)),
    retryBackoff(1000),
  );

  @Effect()
  refreshOnConnect$ = this.actions$.pipe(
    ofType<MQTTConnected>(LocationActionTypes.MQTTConnected),
    switchMapTo(this.store.select(selectLocationIds)),
    switchMap((ids: string[]) => from(ids)),
    map(locationId => new RefreshMeasurmentsOnMQTTConnect({locationId})),
  );

  @Effect()
  refreshOnMessage$ = this.actions$.pipe(
    ofType<MQTTConnected>(LocationActionTypes.MQTTConnected),
    switchMapTo(this.mqttClient.notifications$),
    filter(notification => notification.type === 'MESSAGE'),
    map(notification => notification.message.topic),
    map(topic => this.mqttClient.mapTopicToLocationID(topic)),
    map(locationId => new RefreshMeasurmentsOnMQTTMessage({locationId})),
  );

  @Effect()
  refreshMeasurments$ = this.actions$.pipe(
    ofType<RefreshMeasurmentsOnMQTTConnect | RefreshMeasurmentsOnMQTTMessage>(
      LocationActionTypes.RefreshMeasurmentsOnMQTTConnect,
      LocationActionTypes.RefreshMeasurmentsOnMQTTMessage,
    ),
    map(action => action.payload.locationId),
    mergeMap(locationId => {
      let start = subDays(new Date(), 1);
      return this.measurment.getMeasurments(locationId, start).pipe(
        map((measurments) => new FetchMeasurmentsSuccess({ measurments, locationId })),
        catchError(error => {
          console.error(error);
          let readableError = new Error('Nie udało się pobrać najnowszych pomiarów temperatury.');
          return of(new FetchMeasurmentsError({ error: readableError, locationId }));
        }),
      );
    }),
  );
}
