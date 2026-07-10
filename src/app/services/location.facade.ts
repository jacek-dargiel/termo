import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { isAfter, subHours } from 'date-fns';
import { switchMap } from 'rxjs';
import { environment } from 'environments/environment';

import { LocationStateService } from './location.state';
import { MeasurementStateService } from './measurement.state';
import { ErrorHandlingService } from './error-handling.service';
import { Location, Measurement, LocationWithKeyMeasurementValues } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class LocationFacade {
  private readonly locationState = inject(LocationStateService);
  private readonly measurementState = inject(MeasurementStateService);
  private readonly errorHandling = inject(ErrorHandlingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly refreshProgress = signal(0);
  private readonly totalSeconds = environment.refreshTimeout / 1000;
  private secondsRemaining = signal(this.totalSeconds);
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;
  private timerStarted = false;

  readonly locations = computed(() => this.locationState.locations());
  readonly selectedLocationId = this.locationState.selectedLocationId;
  readonly measurementsByLocation = computed(() => this.measurementState.measurementsByLocation());

  readonly lastMeasurementsByLocation = computed(() => {
    const measurements = this.measurementsByLocation();
    return Object.fromEntries(
      Object.entries(measurements)
        .filter(([, values]) => values.length > 0)
        .map(([key, values]) => [
          key,
          values.reduce((latest, m) =>
            m.created_at > latest.created_at ? m : latest
          ),
        ])
    ) as Record<string, Measurement>;
  });

  readonly minimalMeasurementsByLocation = computed(() => {
    const measurements = this.measurementsByLocation();
    const twelveHoursAgo = subHours(new Date(), 12);
    return Object.fromEntries(
      Object.entries(measurements).flatMap(([key, values]) => {
        const recentValues = values.filter((m) => isAfter(m.created_at, twelveHoursAgo));
        if (recentValues.length === 0) return [];
        return [[
          key,
          recentValues.reduce((min, m) => m.value < min.value ? m : min),
        ]];
      }),
    );
  });

  readonly enrichedLocations = computed((): LocationWithKeyMeasurementValues[] => {
    const locations = this.locations();
    const lastMeasurements = this.lastMeasurementsByLocation();
    const minimalMeasurements = this.minimalMeasurementsByLocation();
    return locations.map((loc) => ({
      ...loc,
      lastMeasurementValue: lastMeasurements[loc.id]?.value ?? null,
      minimalMeasurementValue: minimalMeasurements[loc.id]?.value ?? null,
    }));
  });

  readonly selectedLocation = computed(() => {
    const id = this.selectedLocationId();
    if (!id) return null;
    return this.locations().find((l) => l.id === id) ?? null;
  });

  readonly selectedLocationMeasurements = computed(() => {
    const id = this.selectedLocationId();
    if (!id) return [];
    return this.measurementsByLocation()[id] ?? [];
  });

  readonly isLoading = computed(
    () => this.locationState.loading() || this.measurementState.loading()
  );

  readonly refreshing = computed(() => this.measurementState.loading());

  init(): void {
    this.locationState.load().pipe(
      switchMap(() => {
        const locationIds = this.locationState.locations().map((l) => l.id);
        return this.measurementState.refreshAll(locationIds);
      }),
    ).subscribe({
      next: () => this.startRefreshTimer(),
      error: (err) => {
        // HTTP errors are already handled (throttled toast + Sentry) by the interceptor.
        // Only show toast for domain errors thrown inside LocationStateService.
        if (!(err instanceof HttpErrorResponse)) {
          this.errorHandling.handle(err);
        }
      },
    });
  }

  selectLocation(location: Location): void {
    const measurements = this.measurementsByLocation()[location.id];
    if (!measurements || measurements.length === 0) {
      this.errorHandling.handleImmediate(
        new Error('Brak aktualnych danych do wyświetlenia na wykresie.')
      );
      return;
    }
    this.locationState.selectedLocationId.set(location.id);
  }

  closeChart(): void {
    this.locationState.selectedLocationId.set(null);
  }

  manualRefresh(): void {
    const locationIds = this.locationState.locations().map((l) => l.id);
    this.measurementState.refreshAll(locationIds).subscribe();
    this.resetTimer();
  }

  private startRefreshTimer(): void {
    if (this.timerStarted) return;
    this.timerStarted = true;
    this.stopRefreshTimer();
    this.resetTimer();

    this.refreshTimerId = setInterval(() => {
      if (document.hidden) return;

      const remaining = this.secondsRemaining() - 1;
      if (remaining <= 0) {
        this.refreshProgress.set(1);
        const locationIds = this.locationState.locations().map((l) => l.id);
        this.measurementState.refreshAll(locationIds).subscribe();
        this.resetTimer();
      } else {
        this.secondsRemaining.set(remaining);
        this.refreshProgress.set(1 - (remaining / this.totalSeconds));
      }
    }, 1000);

    this.destroyRef.onDestroy(() => this.stopRefreshTimer());
  }

  private resetTimer(): void {
    this.secondsRemaining.set(this.totalSeconds);
    this.refreshProgress.set(0);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimerId !== null) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }
}
