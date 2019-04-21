import { Injectable } from '@angular/core';
import { Client as PahoClient } from 'paho-mqtt';

import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
// import { Measurment } from 'app/state/measurment/measurment.model';

export interface MQTTNotification {
  type: 'CONNECT_SUCCESS' | 'MESSAGE';
  message?: MQTTMessage;
}

export interface MQTTMessage {
  topic: string;
}

@Injectable({
  providedIn: 'root'
})
export class MQTTClientService {
  private client: PahoClient;
  public notifications$ = new Observable<MQTTNotification>(observer => {
    this.client = new PahoClient(environment.MQTT_BROKER_URL, this.generateClientId());
    this.client.connect({
      onSuccess: () => {
        observer.next({ type: 'CONNECT_SUCCESS' });
      },
      onFailure: ({errorCode, errorMessage}) => {
        observer.error({errorCode, errorMessage});
      },
      reconnect: false,
      cleanSession: true,
    });
    this.client.onMessageArrived = message => {
      observer.next({ type: 'MESSAGE', message });
    };
    this.client.onConnectionLost = ({errorCode, errorMessage}) => {
      observer.error({errorCode, errorMessage});
    };
    return () => {
      if (this.client.connected) {
        this.client.disconnect();
      }
    };
  }).pipe(
    retryBackoff(1000),
    shareReplay(),
  );

  subscribeFeed(feed: string) {
    return new Observable<void>(observer => {
      this.client.subscribe(`przemekd/feeds/${feed}`, {
        onSuccess: () => {
          observer.next();
          observer.complete();
        },
        onFailure: (response) => {
          observer.error(response);
        },
      });
    });
  }

  private generateClientId(): string {
    return (Math.random() * 100000).toFixed(0);
  }

  public mapTopicToLocationID(topic: string) {
    let re = /\w\/feeds\/(.*)/;
    let match = topic.match(re);
    return match[1];
  }
}
