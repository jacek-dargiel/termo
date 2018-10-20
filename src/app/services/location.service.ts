import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
        map(feeds => feeds.map(feed => this.mapFeedToLocation(feed))),
        tap(locations => {
          if (locations.length === 0) {
            throw new Error('0 Locations recived from API.');
          }
        }),
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
    let position: Point;
    try {
      position = JSON.parse(description);
    } catch (e) {
      throw new Error('Failed parsing AIO feed description from JSON to map position');
    }
    if (!position.hasOwnProperty('x') || !position.hasOwnProperty('y')) {
      throw new Error('Feed description does not contain a location position');
    }
    return position;
  }
}
