import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from 'environments/environment';

import { LocationStateService } from './location.state';
import { AIOFeed, Location } from '../interfaces';

function createAIOFeed(overrides?: Partial<AIOFeed>): AIOFeed {
  return {
    id: 1,
    key: 'test-loc',
    name: 'Test Location',
    description: JSON.stringify({ x: 0.5, y: 0.5 }),
    updated_at: new Date().toISOString(),
    username: 'test-user',
    owner: { id: 1, username: 'test-user' },
    history: false,
    unit_type: '',
    unit_symbol: '',
    last_value: '',
    visibility: '',
    license: '',
    created_at: '',
    status_notify: false,
    status_timeout: 0,
    enabled: true,
    group: { id: 1, key: '', name: '', user_id: 1 },
    groups: [],
    ...overrides,
  };
}

describe('LocationStateService', () => {
  let service: LocationStateService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocationStateService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(LocationStateService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('selectedLocationId defaults to null', () => {
    expect(service.selectedLocationId()).toBeNull();
  });

  it('selectedLocationId is writable', () => {
    service.selectedLocationId.set('loc-a');
    expect(service.selectedLocationId()).toBe('loc-a');
    service.selectedLocationId.set(null);
    expect(service.selectedLocationId()).toBeNull();
  });

  describe('load', () => {
    it('after load(), locations signal contains location data from API', async () => {
      const feeds = [
        createAIOFeed({
          key: 'feed-1',
          name: 'Location 1',
          description: JSON.stringify({ x: 1, y: 2 }),
          updated_at: '2024-01-15T12:00:00.000Z',
        }),
        createAIOFeed({
          key: 'feed-2',
          name: 'Location 2',
          description: JSON.stringify({ x: 3, y: 4 }),
          updated_at: '2024-06-20T08:30:00.000Z',
        }),
      ];

      const expected: Location[] = [
        {
          id: 'feed-1',
          name: 'Location 1',
          mapPosition: { x: 1, y: 2 },
          updatedAt: new Date('2024-01-15T12:00:00.000Z'),
        },
        {
          id: 'feed-2',
          name: 'Location 2',
          mapPosition: { x: 3, y: 4 },
          updatedAt: new Date('2024-06-20T08:30:00.000Z'),
        },
      ];

      expect(service.locations()).toEqual([]);

      service.load().subscribe();

      const req = httpTesting.expectOne(`${environment.API_URL}/groups/tunele/feeds`);
      expect(req.request.method).toBe('GET');

      req.flush(feeds);

      await appRef.whenStable();

      expect(service.locations()).toEqual(expected);
    });
  });
});
