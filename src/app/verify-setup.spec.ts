import { cold, Scheduler } from '@granito/vitest-marbles';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Vitest setup verification', () => {
  beforeEach(() => {
    Scheduler.init();
  });

  it('runs a simple marble assertion', () => {
    const source$ = cold('-a-b-|', { a: 1, b: 2 });
    const expected$ = cold('-a-b-|', { a: 1, b: 2 });

    expect(source$).toBeObservable(expected$);
  });
});
