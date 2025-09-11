import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

import { map, tap } from 'rxjs/operators';

import { HttpParams } from '@angular/common/http';

import { Measurment } from '../state/measurment/measurment.model';
import { AIOFeedData } from '../interfaces';
import { environment } from 'environments/environment';

@Injectable()
export class MeasurmentService {
  private api = inject(ApiService);


  getMeasurments(locationKey: string, start?: Date, end?: Date) {
    let params = new HttpParams();
    params = params.append('limit', environment.feedDataLimit);
    if (start) {
      params = params.append('start_time', start.toISOString());
    }
    if (end) {
      params = params.append('end_time', end.toISOString());
    }
    let options = {
      params,
    };
    return this.api.get<AIOFeedData[]>(`/feeds/${locationKey}/data`, options)
      .pipe(
        map(feedData => feedData.map(singleFeedData => this.mapFeedMeasurmentDataToMeasurment(singleFeedData))),
        tap(measurmens => {
          if (measurmens.length === 0) {
            throw new Error('0 Measurments recived from API.');
          }
        }),
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
