import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cold, Scheduler } from '@granito/vitest-marbles';
import { of } from 'rxjs';

import { ApiService } from './api.service';
import { MeasurmentService } from './measurment.service';
import { AIOFeedData } from '../interfaces';
import { Measurment } from '../state/measurment/measurment.model';

const mockAIOFeedData: AIOFeedData = {
  id: 'abc-123',
  value: '42.5',
  feed_id: 7,
  feed_key: 'temp-sensor',
  created_at: '2025-01-15T10:30:00Z',
  location: null,
  lat: null,
  lon: null,
  ele: null,
  created_epoch: 1736935800,
  expiration: '2025-02-15T10:30:00Z',
};

describe('MeasurmentService', () => {
  let service: MeasurmentService;
  let apiGetSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    Scheduler.init();
    const apiServiceMock = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        MeasurmentService,
        { provide: ApiService, useValue: apiServiceMock },
      ],
    });

    service = TestBed.inject(MeasurmentService);
    const api = TestBed.inject(ApiService);
    apiGetSpy = api.get as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapFeedMeasurmentDataToMeasurment', () => {
    it('maps all fields correctly', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment(mockAIOFeedData);

      expect(result).toEqual({
        id: 'abc-123',
        value: 42.5,
        created_at: new Date('2025-01-15T10:30:00Z'),
        feed_id: 7,
        feed_key: 'temp-sensor',
      });
    });

    it('parses value as float via parseFloat', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment({
        ...mockAIOFeedData,
        value: '3.14',
      });

      expect(result.value).toBe(3.14);
    });

    it('handles negative numeric string values', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment({
        ...mockAIOFeedData,
        value: '-10',
      });

      expect(result.value).toBe(-10);
    });

    it('handles zero value', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment({
        ...mockAIOFeedData,
        value: '0',
      });

      expect(result.value).toBe(0);
    });

    it('parses created_at string into Date', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment({
        ...mockAIOFeedData,
        created_at: '2024-06-01T00:00:00Z',
      });

      expect(result.created_at).toEqual(new Date('2024-06-01T00:00:00Z'));
    });

    it('preserves feed_id and feed_key', () => {
      const result = service.mapFeedMeasurmentDataToMeasurment({
        ...mockAIOFeedData,
        feed_id: 99,
        feed_key: 'humidity-sensor',
      });

      expect(result.feed_id).toBe(99);
      expect(result.feed_key).toBe('humidity-sensor');
    });
  });

  describe('getMeasurments', () => {
    it('calls ApiService.get with correct URL containing locationKey', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));

      service.getMeasurments('my-location').subscribe();

      expect(apiGetSpy).toHaveBeenCalledOnce();
      const [url] = apiGetSpy.mock.calls[0];
      expect(url).toBe('/feeds/my-location/data');
    });

    it('sets limit param to feedDataLimit (1000)', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));

      service.getMeasurments('loc').subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('limit')).toBe('1000');
    });

    it('includes start_time when start Date is provided', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));
      const start = new Date('2025-01-01T00:00:00Z');

      service.getMeasurments('loc', start).subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('start_time')).toBe(start.toISOString());
    });

    it('includes end_time when end Date is provided', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));
      const end = new Date('2025-12-31T23:59:59Z');

      service.getMeasurments('loc', undefined, end).subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('end_time')).toBe(end.toISOString());
    });

    it('includes both start_time and end_time when both Dates provided', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-12-31T23:59:59Z');

      service.getMeasurments('loc', start, end).subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('start_time')).toBe(start.toISOString());
      expect(options.params.get('end_time')).toBe(end.toISOString());
    });

    it('does not include start_time or end_time when not provided', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));

      service.getMeasurments('loc').subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('start_time')).toBeNull();
      expect(options.params.get('end_time')).toBeNull();
    });

    it('does not include end_time when only start is provided', () => {
      apiGetSpy.mockReturnValue(of([mockAIOFeedData]));
      const start = new Date('2025-01-01T00:00:00Z');

      service.getMeasurments('loc', start).subscribe();

      const [, options] = apiGetSpy.mock.calls[0];
      expect(options.params.get('start_time')).toBe(start.toISOString());
      expect(options.params.get('end_time')).toBeNull();
    });

    it('maps AIOFeedData[] to Measurment[] correctly', () => {
      const apiResponse = cold('a|', { a: [mockAIOFeedData] });
      apiGetSpy.mockReturnValue(apiResponse);

      const result = service.getMeasurments('loc');

      const expectedMeasurment: Measurment = {
        id: 'abc-123',
        value: 42.5,
        created_at: new Date('2025-01-15T10:30:00Z'),
        feed_id: 7,
        feed_key: 'temp-sensor',
      };
      expect(result).toBeObservable(cold('a|', { a: [expectedMeasurment] }));
    });

    it('throws error when API returns empty array', () => {
      const apiResponse = cold('a|', { a: [] as AIOFeedData[] });
      apiGetSpy.mockReturnValue(apiResponse);

      const result = service.getMeasurments('loc');

      expect(result).toBeObservable(
        cold('#', undefined, new Error('0 Measurments recived from API.')),
      );
    });


  });
});
