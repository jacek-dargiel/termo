import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subHours, subSeconds } from 'date-fns';

import * as fromLocation from './location/location.reducer';
import { Location } from './location/location.model';
import * as fromMeasurment from './measurment/measurment.reducer';
import { Measurment } from './measurment/measurment.model';
import * as selectors from './selectors';

interface RootState {
  location: fromLocation.State;
  measurment: fromMeasurment.State;
}

const createLocation = (
  id: string,
  x: number,
  y: number,
  updatedAt: Date = new Date('2026-01-01T00:00:00.000Z')
): Location => ({
  id,
  name: `Location ${id}`,
  mapPosition: { x, y },
  updatedAt,
});

const createMeasurment = (
  id: string,
  feedKey: string,
  value: number,
  createdAt: Date
): Measurment => ({
  id,
  value,
  created_at: createdAt,
  feed_id: Number(id.replace(/\D/g, '')) || 1,
  feed_key: feedKey,
});

const buildLocationState = (
  locations: Location[],
  overrides: Partial<fromLocation.State> = {}
): fromLocation.State => {
  const seed: fromLocation.State = {
    ...fromLocation.INITIAL_STATE,
    ...overrides,
  };

  return fromLocation.adapter.setAll(locations, seed);
};

const buildMeasurmentState = (
  measurments: Measurment[],
  overrides: Partial<fromMeasurment.State> = {}
): fromMeasurment.State => {
  const seed: fromMeasurment.State = {
    ...fromMeasurment.initialState,
    ...overrides,
  };

  return fromMeasurment.adapter.setAll(measurments, seed);
};

const buildRootState = (
  location: fromLocation.State,
  measurment: fromMeasurment.State
): RootState => ({
  location,
  measurment,
});

describe('state selectors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  it('selects feature slices from root state', () => {
    const locationState = buildLocationState([], { loading: true, selected: 'loc-a' });
    const measurmentState = buildMeasurmentState([], { loading: true });
    const state = buildRootState(locationState, measurmentState);

    expect(selectors.selectLocationState(state)).toBe(locationState);
    expect(selectors.selectMeasurmentState(state)).toBe(measurmentState);
  });

  it('selects selected location id and location loading flag', () => {
    const locationState = buildLocationState([], { selected: 'loc-a', loading: true });

    expect(selectors.selectSelectedLocationID.projector(locationState)).toBe('loc-a');
    expect(selectors.selectLocationLoading.projector(locationState)).toBe(true);
  });

  it('selects all locations, ids, entities, and selected location', () => {
    const locA = createLocation('loc-a', 10, 10);
    const locB = createLocation('loc-b', 1, 1);
    const locationState = buildLocationState([locA, locB], { selected: 'loc-a' });
    const measurmentState = buildMeasurmentState([]);
    const state = buildRootState(locationState, measurmentState);

    const ids = selectors.selectLocationIds(state);
    const entities = selectors.selectLocationEntities(state);
    const allLocations = selectors.selectAllLocations(state);

    expect(ids).toHaveLength(2);
    expect(ids).toEqual(expect.arrayContaining(['loc-a', 'loc-b']));
    expect(Object.keys(entities)).toHaveLength(2);
    expect(Object.keys(entities)).toEqual(expect.arrayContaining(['loc-a', 'loc-b']));
    expect(allLocations.map(location => location.id)).toHaveLength(2);
    expect(allLocations.map(location => location.id)).toEqual(expect.arrayContaining(['loc-a', 'loc-b']));
    expect(selectors.selectSelectedLocation(state)).toEqual(locA);
  });

  it('groups measurements by location and includes empty arrays for known locations', () => {
    const now = new Date();
    const m1 = createMeasurment('m1', 'loc-a', 24, subHours(now, 1));
    const m2 = createMeasurment('m2', 'loc-a', 20, subHours(now, 2));
    const m3 = createMeasurment('m3', 'loc-b', 18, subHours(now, 3));

    const grouped = selectors.selectMeasurmentsByLocation.projector(
      ['loc-a', 'loc-b', 'loc-c'],
      [m1, m2, m3]
    );

    expect(grouped['loc-a']).toEqual([m1, m2]);
    expect(grouped['loc-b']).toEqual([m3]);
    expect(grouped['loc-c']).toEqual([]);
  });

  it('selects measurements for the selected location', () => {
    const grouped: Record<string, Measurment[]> = {
      'loc-a': [createMeasurment('m1', 'loc-a', 10, new Date())],
      'loc-b': [createMeasurment('m2', 'loc-b', 12, new Date())],
    };

    const result = selectors.selectSelectedLocationMeasurments.projector('loc-b', grouped);

    expect(result).toEqual(grouped['loc-b']);
  });

  it('maps latest measurement ids to measurement entities by location', () => {
    const now = new Date();
    const m1 = createMeasurment('m1', 'loc-a', 11, subSeconds(now, 1));
    const m2 = createMeasurment('m2', 'loc-b', 22, now);

    const result = selectors.selectLastMeasurmentsByLocation.projector(
      ['loc-a', 'loc-b', 'loc-c'],
      {
        'loc-a': 'm1',
        'loc-b': 'm2',
        'loc-c': 'missing',
      },
      {
        m1,
        m2,
      }
    );

    expect(result['loc-a']).toEqual(m1);
    expect(result['loc-b']).toEqual(m2);
    expect(result['loc-c']).toBeUndefined();
  });

  it('filters measurements to the minimum time range using a strict 12-hour boundary', () => {
    const now = new Date();
    const inRange = createMeasurment(
      'm-in',
      'loc-a',
      21,
      subHours(now, 11)
    );
    const exactlyBoundary = createMeasurment(
      'm-boundary',
      'loc-a',
      19,
      subHours(now, 12)
    );
    const outOfRange = createMeasurment(
      'm-out',
      'loc-a',
      17,
      subHours(now, 13)
    );

    const result = selectors.selectMeasurmentsFromMinimumRangeByLocation.projector({
      'loc-a': [inRange, exactlyBoundary, outOfRange],
      'loc-b': [],
    });

    expect(result['loc-a']).toEqual([inRange]);
    expect(result['loc-b']).toEqual([]);
  });

  it('selects minimal measurement per location from filtered measurements', () => {
    const now = new Date();
    const a1 = createMeasurment('a1', 'loc-a', 20, subSeconds(now, 1));
    const a2 = createMeasurment('a2', 'loc-a', 14, subSeconds(now, 2));
    const b1 = createMeasurment('b1', 'loc-b', 30, subSeconds(now, 3));

    const result = selectors.selectMinimalMeasurmentsByLocation.projector({
      'loc-a': [a1, a2],
      'loc-b': [b1],
      'loc-c': [],
    });

    expect(result['loc-a']).toEqual(a2);
    expect(result['loc-b']).toEqual(b1);
    expect(result['loc-c']).toBeUndefined();
  });

  it('maps locations with last and minimal measurement values, defaulting to null', () => {
    const locA = createLocation('loc-a', 0, 0);
    const locB = createLocation('loc-b', 1, 1);

    const result = selectors.selectLocationsMappedWithKeyMeasurmentValues.projector(
      [locA, locB],
      {
        'loc-a': createMeasurment('m1', 'loc-a', 25, new Date()),
        'loc-b': createMeasurment('m3', 'loc-b', 30, new Date()),
      },
      {
        'loc-a': createMeasurment('m2', 'loc-a', 15, new Date()),
      }
    );

    expect(result).toEqual([
      {
        ...locA,
        lastMeasurmentValue: 25,
        minimalMeasurmentValue: 15,
      },
      {
        ...locB,
        lastMeasurmentValue: 30,
        minimalMeasurmentValue: null,
      },
    ]);
  });
});
