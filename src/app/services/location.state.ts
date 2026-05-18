import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { AIOFeed, Location, Point } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class LocationStateService {
  private readonly http = inject(HttpClient);

  readonly locations = signal<Location[]>([]);
  readonly loading = signal(false);
  readonly selectedLocationId = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const feeds = await firstValueFrom(
        this.http.get<AIOFeed[]>(`${environment.API_URL}/groups/tunele/feeds`)
      );
      if (feeds.length === 0) {
        throw new Error('0 Locations received from API.');
      }
      const locations = feeds.map(feed => this.mapFeedToLocation(feed));
      this.locations.set(locations);
    } finally {
      this.loading.set(false);
    }
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
