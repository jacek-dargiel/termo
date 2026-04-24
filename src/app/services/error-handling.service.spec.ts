import { describe, expect, it, vi } from 'vitest';

import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  it('creates an instance', () => {
    const service = new ErrorHandlingService();

    expect(service).toBeTruthy();
  });

  it('emits each handled error in order on errors$', () => {
    const service = new ErrorHandlingService();
    const emitted: Error[] = [];
    const subscription = service.errors$.subscribe(error => emitted.push(error));
    const firstError = new Error('first');
    const secondError = new Error('second');

    service.handle(firstError);
    service.handle(secondError);

    expect(emitted).toEqual([firstError, secondError]);

    subscription.unsubscribe();
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
