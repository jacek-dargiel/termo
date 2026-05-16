import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

import { map, tap } from 'rxjs/operators';

import { HttpParams } from '@angular/common/http';

import { Measurement } from '../state/measurement/measurement.model';
import { AIOFeedData } from '../interfaces';
import { environment } from 'environments/environment';

@Injectable()
export class MeasurementService {
  private api = inject(ApiService);


  getMeasurements(locationKey: string, start?: Date, end?: Date) {
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
        map(feedData => feedData.map(singleFeedData => this.mapFeedMeasurementDataToMeasurement(singleFeedData))),
        tap(measurements => {
          if (measurements.length === 0) {
            throw new Error('0 Measurements received from API.');
          }
        }),
      );
  }

  mapFeedMeasurementDataToMeasurement(data: AIOFeedData): Measurement {
    return {
      id: data.id,
      value: parseFloat(data.value),
      created_at: new Date(Date.parse(data.created_at)),
      feed_id: data.feed_id,
      feed_key: data.feed_key,
    };
  }
}
