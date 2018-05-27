import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Measurment } from '../state/measurment/measurment.model';
import { environment } from 'environments/environment.prod';
import { map } from 'rxjs/operators';
import { AIOFeedData } from '../interfaces';
import { aioHeaders } from './aio-headers';

@Injectable()
export class MeasurmentService {

  constructor(
    private http: HttpClient,
  ) { }

  getMeasurments(locationKey: string) {
    const options = {
      headers: aioHeaders,
    };
    return this.http.get<AIOFeedData[]>(`${environment.API_URL}/feeds/${locationKey}/data`, options)
      .pipe(
        map(feedData => feedData.map(singleFeedData => this.mapFeedMeasurmentDataToMeasurment(singleFeedData))),
      );
  }

  mapFeedMeasurmentDataToMeasurment(data: AIOFeedData): Measurment {
    return {
      id: data.id,
      value: parseFloat(data.value),
      created_at: new Date(Date.parse(data.created_at)),
      feed_id: data.feed_id,
      feed_key: data.feed_key,
    };
  }
}
