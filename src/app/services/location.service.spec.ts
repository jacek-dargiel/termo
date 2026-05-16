import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocationService } from './location.service';
import { ApiService } from './api.service';
import { AIOFeed } from '../interfaces';
import { Location } from '../state/location/location.model';

function mockFeed(overrides?: Partial<AIOFeed>): AIOFeed {
  return {
    id: 1,
    key: 'test-feed',
    name: 'Test Feed',
    description: JSON.stringify({ x: 10, y: 20 }),
    updated_at: '2024-01-15T12:00:00.000Z',
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

describe('LocationService', () => {
  let service: LocationService;
  let apiService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiService = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        LocationService,
        { provide: ApiService, useValue: apiService },
      ],
    });

    service = TestBed.inject(LocationService);
  });

  it('creates an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getLocations', () => {
    it('calls ApiService with correct URL', () => {
      apiService.get.mockReturnValue(of([mockFeed()]));

      service.getLocations().subscribe();

      expect(apiService.get).toHaveBeenCalledWith('/groups/tunele/feeds');
    });

    it('maps AIOFeed[] to Location[] correctly', () => {
      const feeds = [
        mockFeed({
          key: 'feed-1',
          name: 'Location 1',
          description: JSON.stringify({ x: 1, y: 2 }),
          updated_at: '2024-01-15T12:00:00.000Z',
        }),
        mockFeed({
          key: 'feed-2',
          name: 'Location 2',
          description: JSON.stringify({ x: 3, y: 4 }),
          updated_at: '2024-06-20T08:30:00.000Z',
        }),
      ];
      apiService.get.mockReturnValue(of(feeds));

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

      let actual: Location[] | undefined;
      service.getLocations().subscribe(result => {
        actual = result;
      });

      expect(actual).toEqual(expected);
    });

    it('throws when API returns empty array', () => {
      apiService.get.mockReturnValue(of([]));

      const errorSpy = vi.fn();
      service.getLocations().subscribe({ next: () => {}, error: errorSpy });

      expect(errorSpy).toHaveBeenCalledWith(new Error('0 Locations recived from API.'));
    });
  });

  describe('mapFeedToLocation', () => {
    it('converts AIOFeed to Location', () => {
      const feed = mockFeed({
        key: 'sensor-42',
        name: 'Kitchen Sensor',
        description: JSON.stringify({ x: 5, y: 10 }),
        updated_at: '2024-03-10T14:30:00.000Z',
      });

      const result = service.mapFeedToLocation(feed);

      expect(result).toEqual({
        id: 'sensor-42',
        name: 'Kitchen Sensor',
        mapPosition: { x: 5, y: 10 },
        updatedAt: new Date('2024-03-10T14:30:00.000Z'),
      });
    });
  });

  describe('parseMapPosition', () => {
    it('parses valid JSON string to Point', () => {
      const result = service.parseMapPosition(JSON.stringify({ x: 15, y: 25 }));

      expect(result).toEqual({ x: 15, y: 25 });
    });

    it('throws on invalid JSON', () => {
      expect(() => service.parseMapPosition('not-json')).toThrow(
        'Failed parsing AIO feed description from JSON to map position',
      );
    });

    it('throws when parsed object lacks x property', () => {
      expect(() => service.parseMapPosition(JSON.stringify({ y: 5 }))).toThrow(
        'Feed description does not contain a location position',
      );
    });

    it('throws when parsed object lacks y property', () => {
      expect(() => service.parseMapPosition(JSON.stringify({ x: 5 }))).toThrow(
        'Feed description does not contain a location position',
      );
    });

    it('throws when parsed object lacks both x and y', () => {
      expect(() => service.parseMapPosition(JSON.stringify({}))).toThrow(
        'Feed description does not contain a location position',
      );
    });
  });
});
