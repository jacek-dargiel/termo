import { TestBed } from '@angular/core/testing';
import { subMilliseconds } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TERMO_CURRENT_TIME_FACTORY } from './current-time.injection-token';
import { IsLocationOutdatedPipe } from './is-location-outdated.pipe';

const THRESHOLD_MS = 900_000;

describe('IsLocationOutdatedPipe', () => {
  let currentTime: Date;
  let currentTimeFactory: ReturnType<typeof vi.fn>;

  const createPipe = () =>
    TestBed.runInInjectionContext(() => new IsLocationOutdatedPipe());

  beforeEach(() => {
    currentTime = new Date('2024-01-10T12:00:00.000Z');
    currentTimeFactory = vi.fn(() => currentTime);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TERMO_CURRENT_TIME_FACTORY,
          useValue: currentTimeFactory,
        },
      ],
    });
  });

  it('creates an instance', () => {
    const pipe = createPipe();

    expect(pipe).toBeTruthy();
  });

  it('returns true when value is older than the threshold', () => {
    const pipe = createPipe();
    const thresholdDate = subMilliseconds(currentTime, THRESHOLD_MS);
    const olderDate = subMilliseconds(thresholdDate, 1);

    expect(pipe.transform(olderDate)).toBe(true);
  });

  it('returns false when value is more recent than the threshold', () => {
    const pipe = createPipe();
    const thresholdDate = subMilliseconds(currentTime, THRESHOLD_MS);
    const newerDate = new Date(thresholdDate.getTime() + 1);

    expect(pipe.transform(newerDate)).toBe(false);
  });

  it('returns false when value equals the threshold boundary', () => {
    const pipe = createPipe();
    const thresholdDate = subMilliseconds(currentTime, THRESHOLD_MS);

    expect(pipe.transform(thresholdDate)).toBe(false);
  });

  it('calls the time factory on every transform', () => {
    const pipe = createPipe();

    pipe.transform(new Date());
    pipe.transform(new Date());

    expect(currentTimeFactory).toHaveBeenCalledTimes(2);
  });
});
