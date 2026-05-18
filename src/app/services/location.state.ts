import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, finalize } from 'rxjs';
import { environment } from 'environments/environment';
import { AIOFeed, Location, Point } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class LocationStateService {
  private readonly http = inject(HttpClient);

  readonly locations = signal<Location[]>([]);
  readonly loading = signal(false);
  readonly selectedLocationId = signal<string | null>(null);

  load(): Observable<void> {
    this.loading.set(true);
    return this.http.get<AIOFeed[]>(`${environment.API_URL}/groups/tunele/feeds`).pipe(
      tap(feeds => {
        if (feeds.length === 0) {
          throw new Error('0 Locations received from API.');
        }
        const locations = feeds.map(feed => this.mapFeedToLocation(feed));
        this.locations.set(locations);
      }),
      finalize(() => this.loading.set(false)),
      map(() => undefined),
    );
  }

  private mapFeedToLocation(feed: AIOFeed): Location {
    let mapPosition: Point;
    try {
      mapPosition = JSON.parse(feed.description);
    } catch {
      throw new Error('Failed parsing AIO feed description from JSON to map position');
    }
    if (!('x' in mapPosition) || !('y' in mapPosition)) {
      throw new Error('Feed description does not contain a location position');
    }
    return {
      id: feed.key,
      name: feed.name,
      mapPosition,
      updatedAt: new Date(Date.parse(feed.updated_at)),
    };
  }
}
