import { describe, expect, it } from 'vitest';

import { FetchMeasurmentsSuccess, FetchMeasurmentsError, MeasurmentActions } from './measurment.actions';
import { RefreshMeasurmentsOnBtnClick, RefreshMeasurmentsOnLocationsLoaded } from '../location/location.actions';
import { Measurment } from './measurment.model';
import { reducer, initialState, adapter } from './measurment.reducer';

const createMeasurment = (
  id: string,
  feedKey: string,
  value: number,
  createdAt: Date = new Date('2026-01-01T00:00:00.000Z'),
): Measurment => ({
  id,
  value,
  created_at: createdAt,
  feed_id: 1,
  feed_key: feedKey,
});

describe('measurmentReducer', () => {
  describe('initialState', () => {
    it('has the correct default shape', () => {
      expect(initialState.ids).toEqual([]);
      expect(initialState.entities).toEqual({});
      expect(initialState.loading).toBe(false);
    });
  });

  describe('unknown action', () => {
    it('returns the same state reference', () => {
      const state = initialState;
      const result = reducer(state, { type: 'UNKNOWN' } as unknown as MeasurmentActions);
      expect(result).toBe(state);
    });
  });

  describe('RefreshMeasurmentsOnBtnClick', () => {
    it('sets loading to true', () => {
      const action = new RefreshMeasurmentsOnBtnClick({ locationId: 'loc-a' });

      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('preserves existing entities', () => {
      const m1 = createMeasurment('m1', 'loc-a', 25);
      const initial = adapter.addOne(m1, initialState);
      const action = new RefreshMeasurmentsOnBtnClick({ locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
      expect(state.ids).toEqual(['m1']);
      expect(state.entities['m1']).toEqual(m1);
    });
  });

  describe('RefreshMeasurmentsOnLocationsLoaded', () => {
    it('sets loading to true', () => {
      const action = new RefreshMeasurmentsOnLocationsLoaded({ locationId: 'loc-a' });

      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('preserves existing entities', () => {
      const m1 = createMeasurment('m1', 'loc-a', 25);
      const initial = adapter.addOne(m1, initialState);
      const action = new RefreshMeasurmentsOnLocationsLoaded({ locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(true);
      expect(state.ids).toEqual(['m1']);
      expect(state.entities['m1']).toEqual(m1);
    });
  });

  describe('FetchMeasurmentsSuccess', () => {
    it('adds measurements to state via adapter.addMany and sets loading to false', () => {
      const m1 = createMeasurment('m1', 'loc-a', 25, new Date('2026-01-02T00:00:00.000Z'));
      const m2 = createMeasurment('m2', 'loc-a', 30, new Date('2026-01-03T00:00:00.000Z'));
      const initial = { ...initialState, loading: true };
      const action = new FetchMeasurmentsSuccess({ measurments: [m1, m2], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toHaveLength(2);
      expect(state.entities['m1']).toEqual(m1);
      expect(state.entities['m2']).toEqual(m2);
    });

    it('handles an empty measurements array', () => {
      const initial = { ...initialState, loading: true };
      const action = new FetchMeasurmentsSuccess({ measurments: [], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toEqual([]);
    });

    it('merges new measurements with existing entities', () => {
      const existing = createMeasurment('existing', 'loc-a', 10, new Date('2026-01-01T00:00:00.000Z'));
      const incoming = createMeasurment('incoming', 'loc-a', 20, new Date('2026-01-02T00:00:00.000Z'));
      const initial = adapter.addOne(existing, { ...initialState, loading: true });
      const action = new FetchMeasurmentsSuccess({ measurments: [incoming], locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toHaveLength(2);
      expect(state.entities['existing']).toEqual(existing);
      expect(state.entities['incoming']).toEqual(incoming);
    });
  });

  describe('FetchMeasurmentsError', () => {
    it('sets loading to false when it was true', () => {
      const initial = { ...initialState, loading: true };
      const action = new FetchMeasurmentsError({ error: new Error('fail'), locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
    });

    it('leaves loading as false when it was already false', () => {
      const action = new FetchMeasurmentsError({ error: new Error('fail'), locationId: 'loc-a' });

      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
    });

    it('preserves existing entities', () => {
      const m1 = createMeasurment('m1', 'loc-a', 25);
      const initial = adapter.addOne(m1, { ...initialState, loading: true });
      const action = new FetchMeasurmentsError({ error: new Error('fail'), locationId: 'loc-a' });

      const state = reducer(initial, action);

      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['m1']);
      expect(state.entities['m1']).toEqual(m1);
    });
  });

  describe('adapter sortComparer', () => {
    it('sorts measurements by created_at ascending', () => {
      const older = createMeasurment('older', 'loc-a', 10, new Date('2026-01-01T00:00:00.000Z'));
      const newer = createMeasurment('newer', 'loc-a', 20, new Date('2026-01-05T00:00:00.000Z'));
      const mid = createMeasurment('mid', 'loc-a', 15, new Date('2026-01-03T00:00:00.000Z'));

      const state = adapter.addMany([newer, older, mid], initialState);

      expect(state.ids).toEqual(['older', 'mid', 'newer']);
    });
  });

  describe('state reference integrity', () => {
    it('returns a new state object on known actions', () => {
      const action = new RefreshMeasurmentsOnBtnClick({ locationId: 'loc-a' });
      const state = reducer(initialState, action);
      expect(state).not.toBe(initialState);
    });

    it('returns the same state object on unknown actions', () => {
      const state = reducer(initialState, { type: 'UNKNOWN' } as unknown as MeasurmentActions);
      expect(state).toBe(initialState);
    });
  });

  describe('adapter exports', () => {
    it('exports selectors from adapter.getSelectors', async () => {
      const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
      expect(selectIds).toBeDefined();
      expect(selectEntities).toBeDefined();
      expect(selectAll).toBeDefined();
      expect(selectTotal).toBeDefined();
    });
  });
});
