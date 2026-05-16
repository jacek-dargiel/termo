import { describe, expect, it, vi } from 'vitest';

import { ToFixedPipe } from './to-fixed.pipe';

describe('ToFixedPipe', () => {
  const locale = 'en-GB';
  const pipe = new ToFixedPipe();

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an en dash for null values', () => {
    expect(pipe.transform(null as unknown as number, 2, locale)).toBe('–');
  });

  it('returns an en dash for non-number values', () => {
    expect(pipe.transform(undefined as unknown as number, 2, locale)).toBe('–');
  });

  it('formats fractions with rounding', () => {
    expect(pipe.transform(Math.PI, 2, locale)).toBe('3.14');
  });

  it('formats negative numbers', () => {
    expect(pipe.transform(-Math.PI, 2, locale)).toBe('-3.14');
  });

  it('pads round numbers to the requested precision', () => {
    expect(pipe.transform(3, 2, locale)).toBe('3.00');
  });

  it('supports arbitrary precision', () => {
    expect(pipe.transform(Math.PI, 5, locale)).toBe('3.14159');
  });

  it('uses precision 2 when precision is omitted or undefined', () => {
    const expected = pipe.transform(Math.PI, 2, locale);

    expect(pipe.transform(Math.PI, undefined, locale)).toBe(expected);
    expect(pipe.transform(Math.PI)).toBe(pipe.transform(Math.PI, 2));
  });

  it('uses locale-specific decimal separators', () => {
    expect(pipe.transform(1.2, 2, 'de-DE')).toBe('1,20');
  });

  it('falls back to toFixed and comma decimal when Intl.NumberFormat throws', () => {
    vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
      throw new Error('Intl unavailable');
    });

    expect(pipe.transform(1.2, 2, locale)).toBe('1,20');
  });
});
