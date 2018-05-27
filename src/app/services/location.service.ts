import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { aioHeaders } from './aio-headers';
import { environment } from 'environments/environment';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AIOFeed, Point } from '../interfaces';
import { Location } from '../state/location/location.model';

@Injectable()
export class LocationService {

  constructor(
    private http: HttpClient,
  ) { }

  getLocations(): Observable<Location[]> {
    const options = {
      headers: aioHeaders,
    };
    return this.http.get<AIOFeed[]>(`${environment.API_URL}/groups/temperatura/feeds`, options)
      .pipe(
        map(feeds => feeds.map(feed => this.mapFeedToLocation(feed)))
      );
  }

  mapFeedToLocation(feed: AIOFeed): Location {
    const mapPosition = this.parseMapPosition(feed.description);
    return {
      id: feed.key,
      name: feed.name,
      mapPosition,
      updatedAt: new Date(Date.parse(feed.updated_at)),
    };
  }

  parseMapPosition(description: string): Point {
    try {
      return JSON.parse(description);
    } catch (e) {
      throw new Error('Failed parsing AIO feed description from JSON to map position');
    }
  }
}
