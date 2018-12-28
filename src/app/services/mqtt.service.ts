import { Injectable } from '@angular/core';
import mqtt from 'mqtt';

import { environment } from 'environments/environment';
import { fromEvent, Observable } from 'rxjs';
import { delayWhen, switchMap, tap, map } from 'rxjs/operators';
import { Measurment } from 'app/state/measurment/measurment.model';

@Injectable({
  providedIn: 'root'
})
export class MQTTClientService {
  private client$ = new Observable<mqtt.MqttClient>(subscriber => {
    let client = mqtt.connect(environment.MQTT_BROKER_URL);
    subscriber.next(client);
    return () => client.end();
  })
    .pipe(
      delayWhen(client => fromEvent(client, 'connect'))
    );

  constructor() { }

  updates(feeds: string[]) {
    return this.client$.pipe(
      tap(client => client.subscribe(feeds.map(feed => `przemekpd/feeds/${feed}`))),
      switchMap(client => {
        console.log({client});
        return fromEvent<[string, any]>(client, 'message');
      }),
      map(([topic, message]) => ({location: this.mapTopicToLocationID(topic), measurment: message as Measurment})),
    );
  }

  private mapTopicToLocationID(topic: string) {
    let re = /przemekpd\/feeds\/(.*)/;
    let match = topic.match(re);
    return match[1];
  }
}
