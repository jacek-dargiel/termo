import { beforeEach, describe, expect, it, vi } from 'vitest';
import { take } from 'rxjs';

import { environment } from '../../environments/environment';

import { RefreshSignalService } from './refresh-signal.service';

describe('RefreshSignalService', () => {
  let service: RefreshSignalService;
  let hidden = false;
  const timeoutSeconds = environment.refreshTimeout / 1_000;

  beforeEach(() => {
    hidden = false;
    vi.useFakeTimers();
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    service = new RefreshSignalService();
  });

  it('creates an instance', () => {
    expect(service).toBeTruthy();
  });

  it('does not emit counter values before restart is called', () => {
    const values: number[] = [];
    const subscription = service.counter.subscribe(value => values.push(value));

    vi.advanceTimersByTime(10_000);

    expect(values).toEqual([]);
    subscription.unsubscribe();
  });

  it('starts a per-second countdown from timeout seconds after restart', () => {
    const values: number[] = [];
    const subscription = service.counter.pipe(take(3)).subscribe(value => values.push(value));

    service.restart();
    vi.advanceTimersByTime(3_000);

    expect(values).toEqual([timeoutSeconds, timeoutSeconds - 1, timeoutSeconds - 2]);
    subscription.unsubscribe();
  });

  it('restarts countdown from full timeout when restart is called again', () => {
    const values: number[] = [];
    const subscription = service.counter.pipe(take(4)).subscribe(value => values.push(value));

    service.restart();
    vi.advanceTimersByTime(2_000);
    service.restart();
    vi.advanceTimersByTime(2_000);

    expect(values).toEqual([timeoutSeconds, timeoutSeconds - 1, timeoutSeconds, timeoutSeconds - 1]);
    subscription.unsubscribe();
  });

  it('emits signal true when countdown reaches zero and document is visible', () => {
    hidden = false;
    const values: boolean[] = [];
    const subscription = service.signal.pipe(take(1)).subscribe(value => values.push(value));

    service.restart();
    vi.advanceTimersByTime(environment.refreshTimeout + 1_000);

    expect(values).toEqual([true]);
    subscription.unsubscribe();
  });

  it('waits for visibility change when timeout occurs while hidden', () => {
    hidden = true;
    const values: boolean[] = [];
    const subscription = service.signal.subscribe(value => values.push(value));

    service.restart();
    vi.advanceTimersByTime(environment.refreshTimeout + 1_000);

    expect(values).toEqual([]);

    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));

    expect(values).toEqual([true]);
    subscription.unsubscribe();
  });

});
