import { reducer, INITIAL_STATE } from './location.reducer';

describe('Location Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      let action = {} as any;

      let result = reducer(INITIAL_STATE, action);

      expect(result).toBe(INITIAL_STATE);
    });
  });
});
