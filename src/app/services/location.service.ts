import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AIOFeed, Point } from '../interfaces';
import { Location } from '../state/location/location.model';

@Injectable()
export class LocationService {

  constructor(
    private api: ApiService,
  ) { }

  getLocations(): Observable<Location[]> {
    return this.api.get<AIOFeed[]>(`/groups/temperatura/feeds`)
      .pipe(
        map(feeds => feeds.map(feed => this.mapFeedToLocation(feed)))
      );
  }

  mapFeedToLocation(feed: AIOFeed): Location {
    let mapPosition = this.parseMapPosition(feed.description);
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
