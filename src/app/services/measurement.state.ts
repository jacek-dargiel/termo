import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Subject, auditTime } from 'rxjs';
import { environment } from 'environments/environment';
import { AIOFeedData, Measurement } from '../interfaces';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({ providedIn: 'root' })
export class MeasurementStateService {
  private readonly http = inject(HttpClient);
  private readonly errorHandling = inject(ErrorHandlingService);

  readonly measurementsByLocation = signal<Record<string, Measurement[]>>({});
  readonly loading = signal(false);

  private readonly errorSubject = new Subject<Error>();

  constructor() {
    this.errorSubject
      .pipe(auditTime(environment.snackbarDefaultTimeout))
      .subscribe((error) => this.errorHandling.handle(error));
  }

  async refreshAll(locationIds: string[], start?: Date): Promise<void> {
    this.loading.set(true);
    try {
      const results = await Promise.allSettled(
        locationIds.map((id) => this.fetchMeasurements(id, start))
      );

      const grouped: Record<string, Measurement[]> = {};
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const measurements = result.value;
          for (const m of measurements) {
            const key = m.feed_key;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m);
          }
        } else {
          const error =
            result.reason instanceof Error
              ? result.reason
              : new Error('Failed to fetch measurements');
          this.errorSubject.next(error);
        }
      }

      const current = this.measurementsByLocation();
      const merged: Record<string, Measurement[]> = { ...current };
      for (const [key, values] of Object.entries(grouped)) {
        const existing = current[key] ?? [];
        const existingIds = new Set(existing.map((m) => m.id));
        const newValues = values.filter((m) => !existingIds.has(m.id));
        merged[key] = [...existing, ...newValues];
      }
      this.measurementsByLocation.set(merged);
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchMeasurements(
    locationKey: string,
    start?: Date,
    end?: Date
  ): Promise<Measurement[]> {
    let params = new HttpParams().append('limit', environment.feedDataLimit);
    if (start) params = params.append('start_time', start.toISOString());
    if (end) params = params.append('end_time', end.toISOString());

    const data = await firstValueFrom(
      this.http.get<AIOFeedData[]>(
        `${environment.API_URL}/feeds/${locationKey}/data`,
        { params }
      )
    );

    if (data.length === 0) {
      throw new Error('0 Measurements received from API.');
    }

    return data.map((item) => this.mapToMeasurement(item));
  }

  private mapToMeasurement(data: AIOFeedData): Measurement {
    return {
      id: data.id,
      value: parseFloat(data.value),
      created_at: new Date(Date.parse(data.created_at)),
      feed_id: data.feed_id,
      feed_key: data.feed_key,
    };
  }
}
