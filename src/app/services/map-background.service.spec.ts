import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cold, Scheduler } from '@granito/vitest-marbles';

import { MapBackgroundService } from './map-background.service';

interface MockImage extends Pick<HTMLImageElement, 'width' | 'height'> {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}

describe('MapBackgroundService', () => {
  let service: MapBackgroundService;

  beforeEach(() => {
    Scheduler.init();
    service = new MapBackgroundService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an instance', () => {
    expect(service).toBeTruthy();
  });

  it('emits image dimensions and completes when image loads successfully', () => {
    globalThis.Image = function (this: MockImage) {
      this.width = 100;
      this.height = 200;
      this.onload = null;
      this.onerror = null;
      Object.defineProperty(this, 'src', {
        set() {
          this.onload?.();
        },
        configurable: true,
      });
    } as unknown as typeof Image;

    const result$ = service.getImageDimentions('test.png');
    const expected$ = cold('(a|)', { a: { width: 100, height: 200 } });

    expect(result$).toBeObservable(expected$);
  });

  it('errors with descriptive message when image fails to load', () => {
    globalThis.Image = function (this: MockImage) {
      this.onload = null;
      this.onerror = null;
      Object.defineProperty(this, 'src', {
        set() {
          this.onerror?.();
        },
        configurable: true,
      });
    } as unknown as typeof Image;

    const result$ = service.getImageDimentions('bad-url.png');
    const expected$ = cold('#', undefined, new Error('Failed to load map background: bad-url.png'));

    expect(result$).toBeObservable(expected$);
  });
});
