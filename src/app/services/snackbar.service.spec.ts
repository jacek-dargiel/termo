import { TestBed } from '@angular/core/testing';
import { cold } from '@granito/vitest-marbles';
import { Observable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { environment } from 'environments/environment';

import { ErrorHandlingService } from './error-handling.service';
import { SnackbarData, SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  const createService = (errors$: Observable<Error>): SnackbarService => {
    TestBed.configureTestingModule({
      providers: [
        SnackbarService,
        { provide: ErrorHandlingService, useValue: { errors$ } },
      ],
    });

    return TestBed.inject(SnackbarService);
  };

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('creates an instance', () => {
    const service = createService(cold('|'));

    expect(service).toBeTruthy();
  });

  it('maps error details to snackbar data', () => {
    const service = createService(cold('|'));
    const error = new Error('Connection failed');

    const result = service.errorToSnackbarData(error);

    expect(result).toEqual({
      message: 'Connection failed',
      timeout: environment.snackbarDefaultTimeout,
    } satisfies SnackbarData);
  });

  it('maps each emitted error from errors$ into snackbar data messages', () => {
    const firstError = new Error('First error');
    const secondError = new Error('Second error');
    const source$ = cold('-a-b-|', { a: firstError, b: secondError });
    const service = createService(source$);

    const expected$ = cold('-a-b-|', {
      a: { message: 'First error', timeout: environment.snackbarDefaultTimeout },
      b: { message: 'Second error', timeout: environment.snackbarDefaultTimeout },
    });

    expect(service.messages).toBeObservable(expected$);
  });

  it('emits snackbar data when ErrorHandlingService handles an error', () => {
    TestBed.configureTestingModule({
      providers: [SnackbarService, ErrorHandlingService],
    });

    const service = TestBed.inject(SnackbarService);
    const errorHandlingService = TestBed.inject(ErrorHandlingService);
    const error = new Error('Some error');
    const handler = vi.fn();
    const subscription = service.messages.subscribe(handler);

    errorHandlingService.handle(error);

    expect(handler).toHaveBeenCalledWith({
      message: 'Some error',
      timeout: environment.snackbarDefaultTimeout,
    } satisfies SnackbarData);

    subscription.unsubscribe();
  });
});
