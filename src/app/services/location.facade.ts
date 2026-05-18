import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { isAfter, subHours } from 'date-fns';
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
    const result: Record<string, Measurement> = {};
    for (const [key, values] of Object.entries(measurements)) {
      if (values.length > 0) {
        result[key] = values.reduce((latest, m) =>
          m.created_at > latest.created_at ? m : latest
        );
      }
    }
    return result;
  });

  readonly minimalMeasurementsByLocation = computed(() => {
    const measurements = this.measurementsByLocation();
    const result: Record<string, Measurement> = {};
    const twelveHoursAgo = subHours(new Date(), 12);
    for (const [key, values] of Object.entries(measurements)) {
      const recentValues = values.filter((m) => isAfter(m.created_at, twelveHoursAgo));
      if (recentValues.length > 0) {
        result[key] = recentValues.reduce((min, m) =>
          m.value < min.value ? m : min
        );
      }
    }
    return result;
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

  async init(): Promise<void> {
    await this.locationState.load();
    const locationIds = this.locationState.locations().map((l) => l.id);
    await this.measurementState.refreshAll(locationIds);
    this.startRefreshTimer();
  }

  selectLocation(location: Location): void {
    const measurements = this.measurementsByLocation()[location.id];
    if (!measurements || measurements.length === 0) {
      this.errorHandling.handle(
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
    this.measurementState.refreshAll(locationIds);
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
        this.measurementState.refreshAll(locationIds);
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
