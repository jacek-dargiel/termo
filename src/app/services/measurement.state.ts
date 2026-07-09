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
          const error = err instanceof Error ? err : new Error('Nie udało się pobrać pomiarów');
          this.errorSubject.next(error);
          return of([] as Measurement[]);
        }),
      )
    );
    return forkJoin(requests).pipe(
      tap((results) => {
        const grouped = Object.groupBy(
          results.flat(),
          (m: Measurement) => m.feed_key,
        ) as Record<string, Measurement[]>;
        this.measurementsByLocation.set(
          this.mergeMeasurements(this.measurementsByLocation(), grouped),
        );
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
            throw new Error(`Otrzymano 0 pomiarów z API dla kanału: ${locationKey}.`);
          }
          return data.map((item) => this.mapToMeasurement(item));
        }),
      );
  }

  private mergeMeasurements(
    current: Record<string, Measurement[]>,
    incoming: Record<string, Measurement[]>,
  ): Record<string, Measurement[]> {
    const merged = { ...current };
    for (const key of Object.keys(incoming)) {
      merged[key] = this.uniqBy(
        [...(current[key] ?? []), ...incoming[key]],
        (m) => m.id,
      );
    }
    return merged;
  }

  private uniqBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>();
    return arr.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
