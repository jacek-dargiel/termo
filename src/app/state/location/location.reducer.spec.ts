import { describe, expect, it } from 'vitest';

import { FetchLocationsSuccess, MapInitialized, RefreshButtonClick, RefreshSignal, RefreshMeasurmentsFinished, FetchLocationsError, SelectLocation } from './location.actions';
import { FetchMeasurmentsSuccess, FetchMeasurmentsError } from '../measurment/measurment.actions';
import { Location } from './location.model';
import { Measurment } from '../measurment/measurment.model';
import { reducer, INITIAL_STATE, adapter } from './location.reducer';

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

describe('locationReducer', () => {
  describe('INITIAL_STATE', () => {
    it('has the correct default shape', () => {
      expect(INITIAL_STATE.ids).toEqual([]);
      expect(INITIAL_STATE.entities).toEqual({});
      expect(INITIAL_STATE.loading).toBe(false);
      expect(INITIAL_STATE.latestMeasurmentIDs).toEqual({});
      expect(INITIAL_STATE.selected).toBeUndefined();
    });
  });

  describe('unknown action', () => {
    it('returns the same state reference', () => {
      const state = INITIAL_STATE;
      const result = reducer(state, { type: 'UNKNOWN' } as any);
      expect(result).toBe(state);
    });
  });

  describe('FetchLocationsSuccess', () => {
    it('sets all locations in state via adapter.setAll', () => {
      const locA = createLocation('loc-a', 10, 10);
      const locB = createLocation('loc-b', 1, 1);
      const action = new FetchLocationsSuccess({ locations: [locA, locB] });

      const state = reducer(INITIAL_STATE, action);

      expect(state.ids).toHaveLength(2);
      expect(state.ids).toEqual(expect.arrayContaining(['loc-a', 'loc-b']));
      expect(state.entities['loc-a']).toEqual(locA);
      expect(state.entities['loc-b']).toEqual(locB);
    });

    it('preserves existing loading and selected state', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, loading: true, selected: 'loc-x' });
      const locB = createLocation('loc-b', 0, 0);
      const action = new FetchLocationsSuccess({ locations: [locB] });

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
      expect(state.selected).toBe('loc-x');
      expect(state.ids).toEqual(['loc-b']);
      expect(state.entities['loc-b']).toEqual(locB);
    });

    it('replaces existing locations with the new set', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setAll([locA], INITIAL_STATE);
      const locB = createLocation('loc-b', 0, 0);
      const action = new FetchLocationsSuccess({ locations: [locB] });

      const state = reducer(initial, action);

      expect(state.ids).toEqual(['loc-b']);
      expect(state.entities['loc-a']).toBeUndefined();
      expect(state.entities['loc-b']).toEqual(locB);
    });
  });

  describe('MapInitialized', () => {
    it('sets loading to true', () => {
      const action = new MapInitialized();

      const state = reducer(INITIAL_STATE, action);

      expect(state.loading).toBe(true);
    });

    it('preserves other state properties', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, selected: 'loc-a' });
      const action = new MapInitialized();

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
      expect(state.ids).toEqual(['loc-a']);
      expect(state.selected).toBe('loc-a');
    });
  });

  describe('RefreshButtonClick', () => {
    it('sets loading to true', () => {
      const action = new RefreshButtonClick();

      const state = reducer(INITIAL_STATE, action);

      expect(state.loading).toBe(true);
    });

    it('preserves other state properties', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, selected: 'loc-a', loading: false });
      const action = new RefreshButtonClick();

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
      expect(state.ids).toEqual(['loc-a']);
      expect(state.selected).toBe('loc-a');
    });
  });

  describe('RefreshSignal', () => {
    it('sets loading to true', () => {
      const action = new RefreshSignal();

      const state = reducer(INITIAL_STATE, action);

      expect(state.loading).toBe(true);
    });
  });

  describe('FetchLocationsError', () => {
    it('sets loading to false', () => {
      const initial = { ...INITIAL_STATE, loading: true };
      const action = new FetchLocationsError({ error: new Error('fail') });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
    });

    it('preserves other state properties', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, loading: true, selected: 'loc-a' });
      const action = new FetchLocationsError({ error: new Error('fail') });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['loc-a']);
      expect(state.selected).toBe('loc-a');
    });
  });

  describe('FetchMeasurmentsError', () => {
    it('sets loading to false', () => {
      const initial = { ...INITIAL_STATE, loading: true };
      const action = new FetchMeasurmentsError({ error: new Error('fail'), locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
    });

    it('preserves other state properties', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, loading: true, selected: 'loc-a' });
      const action = new FetchMeasurmentsError({ error: new Error('fail'), locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['loc-a']);
      expect(state.selected).toBe('loc-a');
    });
  });

  describe('RefreshMeasurmentsFinished', () => {
    it('sets loading to false', () => {
      const initial = { ...INITIAL_STATE, loading: true };
      const action = new RefreshMeasurmentsFinished();

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
    });
  });

  describe('SelectLocation', () => {
    it('sets selected to the location id', () => {
      const locA = createLocation('loc-a', 5, 5);
      const action = new SelectLocation({ location: locA });

      const state = reducer(INITIAL_STATE, action);

      expect(state.selected).toBe('loc-a');
    });

    it('sets selected to null when location is null (short-circuit result of null &&)', () => {
      const initial = { ...INITIAL_STATE, selected: 'loc-a' };
      const action = new SelectLocation({ location: null as unknown as Location });

      const state = reducer(initial, action);

      expect(state.selected).toBeNull();
    });

    it('preserves other state properties', () => {
      const locA = createLocation('loc-a', 5, 5);
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, loading: true });
      const locB = createLocation('loc-b', 10, 10);
      const action = new SelectLocation({ location: locB });

      const state = reducer(initial, action);

      expect(state.selected).toBe('loc-b');
      expect(state.ids).toEqual(['loc-a']);
      expect(state.loading).toBe(true);
    });
  });

  describe('FetchMeasurmentsSuccess', () => {
    const locA = createLocation('loc-a', 5, 5, new Date('2026-01-01T00:00:00.000Z'));

    it('does nothing when measurements array is empty', () => {
      const initial = adapter.setOne(locA, INITIAL_STATE);
      const action = new FetchMeasurmentsSuccess({ measurments: [], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.entities['loc-a']).toEqual(locA);
      expect(state.latestMeasurmentIDs).toEqual({});
    });

    it('updates the location updatedAt to the latest measurement created_at', () => {
      const initial = adapter.setOne(locA, INITIAL_STATE);
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const m2 = createMeasurment('m2', 'loc-a', 30, new Date('2026-01-03T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [m1, m2], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.entities['loc-a']!.updatedAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
    });

    it('sorts measurements and picks the latest regardless of input order', () => {
      const initial = adapter.setOne(locA, INITIAL_STATE);
      const older = createMeasurment('older', 'loc-a', 10, new Date('2026-01-01T00:00:00.000Z'));
      const newer = createMeasurment('newer', 'loc-a', 20, new Date('2026-01-05T00:00:00.000Z'));
      const mid = createMeasurment('mid', 'loc-a', 15, new Date('2026-01-03T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [newer, older, mid], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.entities['loc-a']!.updatedAt).toEqual(new Date('2026-01-05T00:00:00.000Z'));
    });

    it('stores the latest measurement id in latestMeasurmentIDs', () => {
      const initial = adapter.setOne(locA, INITIAL_STATE);
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const m2 = createMeasurment('m2', 'loc-a', 30, new Date('2026-01-03T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [m1, m2], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.latestMeasurmentIDs['loc-a']).toBe('m2');
    });

    it('preserves existing latestMeasurmentIDs for other locations', () => {
      const locB = createLocation('loc-b', 10, 10);
      const initial = adapter.setAll([locA, locB], {
        ...INITIAL_STATE,
        latestMeasurmentIDs: { 'loc-b': 'old-b' },
      });
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [m1], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.latestMeasurmentIDs['loc-a']).toBe('m1');
      expect(state.latestMeasurmentIDs['loc-b']).toBe('old-b');
    });

    it('does not change loading flag', () => {
      const initial = adapter.setOne(locA, { ...INITIAL_STATE, loading: true });
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [m1], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
    });

    it('overwrites latestMeasurmentID for the same location', () => {
      const initial = adapter.setOne(locA, {
        ...INITIAL_STATE,
        latestMeasurmentIDs: { 'loc-a': 'old-m' },
      });
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const action = new FetchMeasurmentsSuccess({ measurments: [m1], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.latestMeasurmentIDs['loc-a']).toBe('m1');
    });
  });

  describe('adapter sortComparer', () => {
    it('sorts locations by the sum of x and y map position', () => {
      const locFar = createLocation('loc-far', 10, 10); // sum = 20
      const locNear = createLocation('loc-near', 1, 1); // sum = 2
      const locMid = createLocation('loc-mid', 5, 3); // sum = 8

      const state = adapter.setAll([locFar, locNear, locMid], INITIAL_STATE);

      expect(state.ids).toEqual(['loc-near', 'loc-mid', 'loc-far']);
    });
  });

  describe('state reference integrity', () => {
    it('returns a new state object on known actions', () => {
      const action = new MapInitialized();
      const state = reducer(INITIAL_STATE, action);
      expect(state).not.toBe(INITIAL_STATE);
    });

    it('returns the same state object on unknown actions', () => {
      const state = reducer(INITIAL_STATE, { type: 'UNKNOWN' } as any);
      expect(state).toBe(INITIAL_STATE);
    });
  });
});
