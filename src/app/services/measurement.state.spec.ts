import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { subDays } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from 'environments/environment';

import { MeasurementStateService } from './measurement.state';
import { AIOFeedData } from '../interfaces';

function createAIOFeedData(overrides?: Partial<AIOFeedData>): AIOFeedData {
  return {
    id: '1',
    value: '21.5',
    feed_id: 1,
    feed_key: 'loc-a',
    created_at: new Date().toISOString(),
    location: null,
    lat: null,
    lon: null,
    ele: null,
    created_epoch: 1234,
    expiration: '',
    ...overrides,
  };
}

describe('MeasurementStateService', () => {
  let service: MeasurementStateService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MeasurementStateService,
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(MeasurementStateService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  describe('refreshAll', () => {
    const fixedNow = new Date('2026-05-18T12:00:00Z');

    beforeEach(() => {
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const urlFor = (key: string) => {
      const start = subDays(fixedNow, 1).toISOString();
      return `${environment.API_URL}/feeds/${key}/data?limit=${environment.feedDataLimit}&start_time=${start}`;
    };

    it('after refreshAll(ids), measurementsByLocation groups data by feed_key', async () => {
      const locAData = [
        createAIOFeedData({ id: 'a1', value: '10.0', feed_key: 'loc-a' }),
        createAIOFeedData({ id: 'a2', value: '11.0', feed_key: 'loc-a' }),
      ];
      const locBData = [
        createAIOFeedData({ id: 'b1', value: '20.0', feed_key: 'loc-b' }),
      ];

      expect(service.measurementsByLocation()).toEqual({});
      expect(service.loading()).toBe(false);

      service.refreshAll(['loc-a', 'loc-b']).subscribe();

      const reqA = httpTesting.expectOne(urlFor('loc-a'));
      expect(reqA.request.method).toBe('GET');
      const reqB = httpTesting.expectOne(urlFor('loc-b'));
      expect(reqB.request.method).toBe('GET');

      reqA.flush(locAData);
      reqB.flush(locBData);

      await appRef.whenStable();

      const result = service.measurementsByLocation();
      expect(Object.keys(result).sort()).toEqual(['loc-a', 'loc-b']);
      expect(result['loc-a'].length).toBe(2);
      expect(result['loc-b'].length).toBe(1);
      expect(result['loc-a'][0].feed_key).toBe('loc-a');
      expect(result['loc-b'][0].feed_key).toBe('loc-b');
      expect(service.loading()).toBe(false);
    });

    it('refreshAll sets loading to true during fetch', async () => {
      service.refreshAll(['loc-a']).subscribe();

      expect(service.loading()).toBe(true);

      const req = httpTesting.expectOne(urlFor('loc-a'));
      req.flush([createAIOFeedData({ feed_key: 'loc-a' })]);

      await appRef.whenStable();

      expect(service.loading()).toBe(false);
    });

    it('when one feed fails, successful feeds still populate measurements and loading resets', async () => {
      const goodFeed = createAIOFeedData({ id: '1', feed_key: 'loc-a', value: '21.5' });

      service.refreshAll(['loc-a', 'loc-b']).subscribe();

      httpTesting.expectOne(urlFor('loc-a')).flush([goodFeed]);
      httpTesting.expectOne(urlFor('loc-b')).flush(
        'Server error',
        { status: 500, statusText: 'Internal Server Error' },
      );

      await appRef.whenStable();

      const result = service.measurementsByLocation();
      // loc-b's feed is absent because its request failed → empty fallback
      expect(Object.keys(result)).toEqual(['loc-a']);
      expect(result['loc-a'].length).toBe(1);
      expect(result['loc-a'][0].value).toBe(21.5);
      expect(service.loading()).toBe(false);
    });

    it('when API returns empty array for a feed, no measurements are stored for that key', async () => {
      service.refreshAll(['loc-a']).subscribe();

      httpTesting.expectOne(urlFor('loc-a')).flush([]);

      await appRef.whenStable();

      const result = service.measurementsByLocation();
      expect(result).toEqual({});
      expect(service.loading()).toBe(false);
    });
  });
});
