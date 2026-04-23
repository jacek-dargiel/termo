import { reducer, initialState } from './measurment.reducer';
import { FetchMeasurmentsSuccess, FetchMeasurmentsError } from './measurment.actions';
import { RefreshMeasurmentsOnBtnClick } from '../location/location.actions';
import { Measurment } from './measurment.model';

describe('Measurment Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = { type: 'NOOP' };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = reducer(initialState, action as any);

      expect(result).toBe(initialState);
    });
  });

  it('should set loading true on refresh actions', () => {
    const action = new RefreshMeasurmentsOnBtnClick({ locationId: 'loc1' });

    const result = reducer(initialState, action);

    expect(result.loading).toBe(true);
  });

  it('should add measurments and clear loading on FetchMeasurmentsSuccess', () => {
    const meas: Measurment = {
      id: 'm1',
      value: 42,
      created_at: new Date('2020-01-01T00:00:00Z'),
      feed_id: 1,
      feed_key: 'feed',
    };

    const action = new FetchMeasurmentsSuccess({ measurments: [meas], locationId: 'loc1' });

    const result = reducer({ ...initialState, loading: true }, action);

    expect(result.loading).toBe(false);
    expect(result.ids.length).toBe(1);
    expect(result.entities['m1']).toBeDefined();
    });

    it('should clear loading on FetchMeasurmentsError', () => {
    const action = new FetchMeasurmentsError({ error: new Error('err'), locationId: 'loc1' });

    const result = reducer({ ...initialState, loading: true }, action);

    expect(result.loading).toBe(false);
  });
});
