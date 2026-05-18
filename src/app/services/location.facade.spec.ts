import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { subHours } from 'date-fns';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { LocationFacade } from './location.facade';
import { LocationStateService } from './location.state';
import { MeasurementStateService } from './measurement.state';
import { ErrorHandlingService } from './error-handling.service';
import { Location, Measurement } from '../interfaces';
import { environment } from 'environments/environment';

function createLocation(overrides?: Partial<Location>): Location {
  return {
    id: 'loc-a',
    name: 'Location A',
    mapPosition: { x: 0.5, y: 0.5 },
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMeasurement(overrides?: Partial<Measurement>): Measurement {
  return {
    id: '1',
    value: 20,
    created_at: new Date(),
    feed_id: 1,
    feed_key: 'loc-a',
    ...overrides,
  };
}

describe('LocationFacade', () => {
  let locationFacade: LocationFacade;
  let mockLocationState: {
    locations: ReturnType<typeof signal<Location[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    selectedLocationId: ReturnType<typeof signal<string | null>>;
    load: ReturnType<typeof vi.fn>;
  };
  let mockMeasurementState: {
    measurementsByLocation: ReturnType<typeof signal<Record<string, Measurement[]>>>;
    loading: ReturnType<typeof signal<boolean>>;
    refreshAll: ReturnType<typeof vi.fn>;
  };
  let mockErrorHandling: { handle: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockLocationState = {
      locations: signal<Location[]>([]),
      loading: signal(false),
      selectedLocationId: signal<string | null>(null),
      load: vi.fn(() => of(undefined)),
    };
    mockMeasurementState = {
      measurementsByLocation: signal<Record<string, Measurement[]>>({}),
      loading: signal(false),
      refreshAll: vi.fn(() => of(undefined)),
    };
    mockErrorHandling = { handle: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        LocationFacade,
        { provide: LocationStateService, useValue: mockLocationState },
        { provide: MeasurementStateService, useValue: mockMeasurementState },
        { provide: ErrorHandlingService, useValue: mockErrorHandling },
        provideZonelessChangeDetection(),
      ],
    });

    locationFacade = TestBed.inject(LocationFacade);
  });

  describe('enrichedLocations', () => {
    it('combines locations with latest and minimal measurement values', () => {
      const now = new Date();
      const loc = createLocation({ id: 'loc-a', name: 'A' });
      mockLocationState.locations.set([loc]);

      mockMeasurementState.measurementsByLocation.set({
        'loc-a': [
          createMeasurement({ id: '1', value: 20, created_at: subHours(now, 1), feed_key: 'loc-a' }),
          createMeasurement({ id: '2', value: 18, created_at: subHours(now, 3), feed_key: 'loc-a' }),
        ],
      });

      const result = locationFacade.enrichedLocations();
      expect(result).toHaveLength(1);
      expect(result[0].lastMeasurementValue).toBe(20);
      expect(result[0].minimalMeasurementValue).toBe(18);
    });

    it('returns null for lastMeasurementValue when no measurements exist', () => {
      const loc = createLocation({ id: 'loc-a' });
      mockLocationState.locations.set([loc]);
      mockMeasurementState.measurementsByLocation.set({});

      const result = locationFacade.enrichedLocations();
      expect(result[0].lastMeasurementValue).toBeNull();
      expect(result[0].minimalMeasurementValue).toBeNull();
    });

    it('excludes measurements older than 12 hours from minimal calculation', () => {
      const now = new Date();
      const loc = createLocation({ id: 'loc-a' });
      mockLocationState.locations.set([loc]);

      mockMeasurementState.measurementsByLocation.set({
        'loc-a': [
          createMeasurement({ id: '1', value: 5, created_at: subHours(now, 1), feed_key: 'loc-a' }),
          createMeasurement({ id: '2', value: 3, created_at: subHours(now, 13), feed_key: 'loc-a' }),
        ],
      });

      const result = locationFacade.enrichedLocations();
      expect(result[0].minimalMeasurementValue).toBe(5);
    });
  });

  describe('selectedLocation', () => {
    it('returns the location matching selectedLocationId', () => {
      const locA = createLocation({ id: 'loc-a', name: 'A' });
      const locB = createLocation({ id: 'loc-b', name: 'B' });
      mockLocationState.locations.set([locA, locB]);
      mockLocationState.selectedLocationId.set('loc-a');

      expect(locationFacade.selectedLocation()).toEqual(locA);
    });

    it('returns null when selectedLocationId is null', () => {
      const locA = createLocation({ id: 'loc-a' });
      mockLocationState.locations.set([locA]);
      mockLocationState.selectedLocationId.set(null);

      expect(locationFacade.selectedLocation()).toBeNull();
    });

    it('returns null when selectedLocationId does not match any location', () => {
      const locA = createLocation({ id: 'loc-a' });
      mockLocationState.locations.set([locA]);
      mockLocationState.selectedLocationId.set('nonexistent');

      expect(locationFacade.selectedLocation()).toBeNull();
    });
  });

  describe('selectedLocationMeasurements', () => {
    it('returns measurements for the selected location', () => {
      const measurements = [
        createMeasurement({ id: '1', value: 10, feed_key: 'loc-a' }),
        createMeasurement({ id: '2', value: 20, feed_key: 'loc-a' }),
      ];
      mockMeasurementState.measurementsByLocation.set({ 'loc-a': measurements });
      mockLocationState.selectedLocationId.set('loc-a');

      expect(locationFacade.selectedLocationMeasurements()).toEqual(measurements);
    });

    it('returns empty array when no location selected', () => {
      mockMeasurementState.measurementsByLocation.set({
        'loc-a': [createMeasurement()],
      });
      mockLocationState.selectedLocationId.set(null);

      expect(locationFacade.selectedLocationMeasurements()).toEqual([]);
    });
  });

  describe('isLoading', () => {
    it('is true when locationState is loading', () => {
      mockLocationState.loading.set(true);
      mockMeasurementState.loading.set(false);

      expect(locationFacade.isLoading()).toBe(true);
    });

    it('is true when measurementState is loading', () => {
      mockLocationState.loading.set(false);
      mockMeasurementState.loading.set(true);

      expect(locationFacade.isLoading()).toBe(true);
    });

    it('is false when neither is loading', () => {
      mockLocationState.loading.set(false);
      mockMeasurementState.loading.set(false);

      expect(locationFacade.isLoading()).toBe(false);
    });
  });

  describe('refreshing', () => {
    it('reflects measurementState loading', () => {
      mockMeasurementState.loading.set(true);
      expect(locationFacade.refreshing()).toBe(true);

      mockMeasurementState.loading.set(false);
      expect(locationFacade.refreshing()).toBe(false);
    });
  });

  describe('selectLocation', () => {
    it('shows error and does not select when location has no measurements', () => {
      mockLocationState.selectedLocationId.set(null);
      mockMeasurementState.measurementsByLocation.set({ 'loc-a': [] });

      const loc = createLocation({ id: 'loc-a' });
      locationFacade.selectLocation(loc);

      expect(mockErrorHandling.handle).toHaveBeenCalledTimes(1);
      const errorArg = mockErrorHandling.handle.mock.calls[0][0];
      expect(errorArg.message).toContain('Brak aktualnych danych');
      expect(mockLocationState.selectedLocationId()).toBeNull();
    });

    it('shows error and does not select when location has no measurement entry', () => {
      mockLocationState.selectedLocationId.set(null);
      mockMeasurementState.measurementsByLocation.set({});

      const loc = createLocation({ id: 'loc-a' });
      locationFacade.selectLocation(loc);

      expect(mockErrorHandling.handle).toHaveBeenCalledTimes(1);
      const errorArg = mockErrorHandling.handle.mock.calls[0][0];
      expect(errorArg.message).toContain('Brak aktualnych danych');
      expect(mockLocationState.selectedLocationId()).toBeNull();
    });

    it('selects location when measurements exist', () => {
      mockLocationState.selectedLocationId.set(null);
      mockMeasurementState.measurementsByLocation.set({
        'loc-a': [createMeasurement()],
      });

      const loc = createLocation({ id: 'loc-a' });
      locationFacade.selectLocation(loc);

      expect(mockErrorHandling.handle).not.toHaveBeenCalled();
      expect(mockLocationState.selectedLocationId()).toBe('loc-a');
    });
  });

  describe('closeChart', () => {
    it('clears selectedLocationId', () => {
      mockLocationState.selectedLocationId.set('loc-a');

      locationFacade.closeChart();

      expect(mockLocationState.selectedLocationId()).toBeNull();
    });
  });

  describe('init', () => {
    it('loads locations then refreshes measurements for all locations', () => {
      const locA = createLocation({ id: 'loc-a' });
      const locB = createLocation({ id: 'loc-b' });

      mockLocationState.load.mockImplementation(() => {
        mockLocationState.locations.set([locA, locB]);
        return of(undefined);
      });

      locationFacade.init();

      expect(mockLocationState.load).toHaveBeenCalledTimes(1);
      expect(mockMeasurementState.refreshAll).toHaveBeenCalledTimes(1);
      expect(mockMeasurementState.refreshAll).toHaveBeenCalledWith(['loc-a', 'loc-b']);
    });
  });

  describe('refresh timer', () => {
    beforeEach(() => {
      mockLocationState.locations.set([createLocation({ id: 'loc-a' })]);
    });

    it('init starts periodic refresh that calls refreshAll every refreshTimeout', () => {
      vi.useFakeTimers();

      locationFacade.init();

      expect(mockMeasurementState.refreshAll).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(environment.refreshTimeout + 1000);

      expect(mockMeasurementState.refreshAll).toHaveBeenCalledTimes(2);
    });

    it('refreshProgress counts from 0 toward 1 over refreshTimeout', () => {
      vi.useFakeTimers();

      locationFacade.init();
      expect(locationFacade.refreshProgress()).toBe(0);

      vi.advanceTimersByTime(environment.refreshTimeout / 2);
      expect(locationFacade.refreshProgress()).toBeCloseTo(0.5, 0);
    });

    it('manualRefresh resets progress and calls refreshAll', () => {
      locationFacade.manualRefresh();

      expect(mockMeasurementState.refreshAll).toHaveBeenCalledWith(['loc-a']);
      expect(locationFacade.refreshProgress()).toBe(0);
    });

    it('does not refresh when document is hidden', () => {
      vi.useFakeTimers();

      locationFacade.init();
      const callsAfterInit = mockMeasurementState.refreshAll.mock.calls.length;

      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

      vi.advanceTimersByTime(environment.refreshTimeout + 2000);

      expect(mockMeasurementState.refreshAll).toHaveBeenCalledTimes(callsAfterInit);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
