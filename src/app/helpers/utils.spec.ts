import { describe, expect, it, vi } from 'vitest';

import { mapToObject, mapValuesWithKey } from './utils';

describe('utils helpers', () => {
  describe('mapValuesWithKey', () => {
    it('maps each record value and passes value/key to iterator', () => {
      const input = { alpha: 1, beta: 2 };
      const iterator = vi.fn((value: number, key: string) => `${key}:${value * 2}`);

      const result = mapValuesWithKey(input, iterator);

      expect(result).toEqual({
        alpha: 'alpha:2',
        beta: 'beta:4',
      });
      expect(iterator).toHaveBeenCalledTimes(2);
      expect(iterator).toHaveBeenNthCalledWith(1, 1, 'alpha');
      expect(iterator).toHaveBeenNthCalledWith(2, 2, 'beta');
    });

    it('returns an empty object and does not call iterator for empty input', () => {
      const iterator = vi.fn();

      const result = mapValuesWithKey({}, iterator);

      expect(result).toEqual({});
      expect(iterator).not.toHaveBeenCalled();
    });

    it('returns a new object reference', () => {
      const input = { a: 1 };

      const result = mapValuesWithKey(input, value => value);

      expect(result).toEqual(input);
      expect(result).not.toBe(input);
    });
  });

  describe('mapToObject', () => {
    it('creates a string-keyed object from mixed primitive keys', () => {
      const input = [1, true, 'x'];
      const iterator = vi.fn((value: unknown) => typeof value);

      const result = mapToObject(input, iterator);

      expect(result).toEqual({
        '1': 'number',
        true: 'boolean',
        x: 'string',
      });
      expect(iterator).toHaveBeenCalledTimes(3);
      expect(iterator).toHaveBeenNthCalledWith(1, 1);
      expect(iterator).toHaveBeenNthCalledWith(2, true);
      expect(iterator).toHaveBeenNthCalledWith(3, 'x');
    });

    it('uses custom toString() for object keys', () => {
      const keyLike = { toString: () => 'custom-key' };

      const result = mapToObject([keyLike], () => 42);

      expect(result).toEqual({
        'custom-key': 42,
      });
    });

    it('keeps the last value when keys collide after string conversion', () => {
      const result = mapToObject([1, '1'], value => typeof value);

      expect(result).toEqual({
        '1': 'string',
      });
    });

    it('returns an empty object and does not call iterator for empty array', () => {
      const iterator = vi.fn();

      const result = mapToObject([], iterator);

      expect(result).toEqual({});
      expect(iterator).not.toHaveBeenCalled();
    });
  });
});
