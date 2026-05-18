import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, auditTime, forkJoin, of, map, tap, finalize, catchError } from 'rxjs';
import { subDays } from 'date-fns';
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

  refreshAll(locationIds: string[], start: Date = subDays(new Date(), 1)): Observable<void> {
    this.loading.set(true);
    const requests = locationIds.map((id) =>
      this.fetchMeasurements(id, start).pipe(
        catchError((err) => {
          const error = err instanceof Error ? err : new Error('Failed to fetch measurements');
          this.errorSubject.next(error);
          return of([] as Measurement[]);
        }),
      )
    );
    return forkJoin(requests).pipe(
      tap((results) => {
        const grouped: Record<string, Measurement[]> = {};
        for (const measurements of results) {
          for (const m of measurements) {
            const key = m.feed_key;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m);
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
      }),
      finalize(() => this.loading.set(false)),
      map(() => undefined),
    );
  }

  private fetchMeasurements(
    locationKey: string,
    start?: Date,
    end?: Date
  ): Observable<Measurement[]> {
    let params = new HttpParams().append('limit', environment.feedDataLimit);
    if (start) params = params.append('start_time', start.toISOString());
    if (end) params = params.append('end_time', end.toISOString());

    return this.http
      .get<AIOFeedData[]>(`${environment.API_URL}/feeds/${locationKey}/data`, { params })
      .pipe(
        map((data) => {
          if (data.length === 0) {
            throw new Error('0 Measurements received from API.');
          }
          return data.map((item) => this.mapToMeasurement(item));
        }),
      );
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
