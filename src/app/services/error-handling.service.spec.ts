import { cold } from '@granito/vitest-marbles';
import { describe, expect, it, vi } from 'vitest';

import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  it('creates an instance', () => {
    const service = new ErrorHandlingService();

    expect(service).toBeTruthy();
  });

  it('emits each handled error in order on errors$', () => {
    const service = new ErrorHandlingService();
    const firstError = new Error('first');
    const secondError = new Error('second');

    cold('-ab', { a: firstError, b: secondError }).subscribe(error => service.handle(error));

    const expected$ = cold('-ab', { a: firstError, b: secondError });

    expect(service.errors$).toBeObservable(expected$);
  });

  it('emits the same Error instance passed to handle', () => {
    const service = new ErrorHandlingService();
    const error = new Error('boom');
    let emitted: Error | undefined;

    const subscription = service.errors$.subscribe(value => {
      emitted = value;
    });

    service.handle(error);

    expect(emitted).toBe(error);

    subscription.unsubscribe();
  });

  it('does not emit before handle is called', () => {
    const service = new ErrorHandlingService();
    const handler = vi.fn();

    const subscription = service.errors$.subscribe(handler);

    expect(handler).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });
});
