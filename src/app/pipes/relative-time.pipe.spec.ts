import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TERMO_CURRENT_TIME_FACTORY } from './current-time.injection-token';
import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let currentTime: Date;
  let currentTimeFactory: ReturnType<typeof vi.fn>;

  const createPipe = () =>
    TestBed.runInInjectionContext(() => new RelativeTimePipe());

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an instance', () => {
    const pipe = createPipe();

    expect(pipe).toBeTruthy();
  });

  it('returns days for values older than two days', () => {
    const pipe = createPipe();

    const result = pipe.transform(new Date('2024-01-08T11:59:59.000Z'));

    expect(result).toBe('2 dni');
  });

  it('returns hours at the strict two-day boundary', () => {
    const pipe = createPipe();

    const result = pipe.transform(new Date('2024-01-08T12:00:00.000Z'));

    expect(result).toBe('48 godz.');
  });

  it('returns minutes for a value exactly two hours old', () => {
    const pipe = createPipe();

    const result = pipe.transform(new Date('2024-01-10T10:00:00.000Z'));

    expect(result).toBe('120 min.');
  });

  it('returns minutes for recent values', () => {
    const pipe = createPipe();

    const result = pipe.transform(new Date('2024-01-10T11:59:00.000Z'));

    expect(result).toBe('1 min.');
  });

  it('returns negative minutes for future values', () => {
    const pipe = createPipe();

    const result = pipe.transform(new Date('2024-01-10T12:01:00.000Z'));

    expect(result).toBe('-1 min.');
  });

  it('recomputes current time on every transform call', () => {
    const pipe = createPipe();
    const value = new Date('2024-01-10T11:00:00.000Z');

    const first = pipe.transform(value);

    currentTime = new Date('2024-01-10T14:30:00.000Z');
    const second = pipe.transform(value);

    expect(first).toBe('60 min.');
    expect(second).toBe('3 godz.');
    expect(currentTimeFactory).toHaveBeenCalledTimes(2);
  });
});
