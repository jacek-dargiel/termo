import { reducer, INITIAL_STATE } from './location.reducer';
import { FetchLocationsSuccess, SelectLocation } from './location.actions';
import { FetchMeasurmentsSuccess } from '../measurment/measurment.actions';
import { Location } from './location.model';

describe('Location Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = { type: 'NOOP' };

      const result = reducer(INITIAL_STATE, action as any);

      expect(result).toBe(INITIAL_STATE);
    });
  });

  it('should set locations on FetchLocationsSuccess', () => {
    const loc: Location = { id: 'l1', name: 'Loc1', mapPosition: { x: 0, y: 0 }, updatedAt: new Date() };
    const action = new FetchLocationsSuccess({ locations: [loc] });

    const result = reducer(INITIAL_STATE, action);

    expect(result.ids.length).toBe(1);
    expect(result.entities['l1']).toBeDefined();
  });

  it('should set selected on SelectLocation', () => {
    const loc: Location = { id: 'l2', name: 'Loc2', mapPosition: { x: 1, y: 1 }, updatedAt: new Date() };
    const action = new SelectLocation({ location: loc });

    const result = reducer(INITIAL_STATE, action);

    expect(result.selected).toBe('l2');
  });

  it('should update latestMeasurmentIDs and updatedAt on FetchMeasurmentsSuccess', () => {
    // prepare state with one location
    const loc: Location = { id: 'l3', name: 'Loc3', mapPosition: { x: 2, y: 2 }, updatedAt: new Date('2020-01-01') };
    const stateWithLoc = reducer(INITIAL_STATE, new FetchLocationsSuccess({ locations: [loc] }));

    const meas = { id: 'm10', value: 10, created_at: new Date('2020-02-01T00:00:00Z'), feed_id: 1, feed_key: 'k' };
    const action = new FetchMeasurmentsSuccess({ measurments: [meas], locationId: 'l3' });

    const result = reducer(stateWithLoc, action);

    expect(result.latestMeasurmentIDs['l3']).toBe('m10');
    expect(result.entities['l3'].updatedAt).toEqual(meas.created_at);
  });
});
