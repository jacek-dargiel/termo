import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';

import {
  extractErrorMessage,
  handleHttpError,
} from './http-error.interceptor';
import { ErrorHandlingService } from '../services/error-handling.service';

describe('extractErrorMessage', () => {
  it('returns network error message from ErrorEvent', () => {
    const err = new HttpErrorResponse({
      error: new ErrorEvent('error', { message: 'Failed to fetch' }),
      status: 0,
    });
    expect(extractErrorMessage(err)).toBe('Failed to fetch');
  });

  it('returns default network message when ErrorEvent has no message', () => {
    const err = new HttpErrorResponse({
      error: new ErrorEvent('error'),
      status: 0,
    });
    expect(extractErrorMessage(err)).toBe('Błąd połączenia z serwerem.');
  });

  it('extracts message from JSON error body', () => {
    const err = new HttpErrorResponse({
      error: { message: 'Rate limit exceeded' },
      status: 429,
    });
    expect(extractErrorMessage(err)).toBe('Rate limit exceeded');
  });

  it('returns generic 500 message', () => {
    const err = new HttpErrorResponse({
      error: 'Internal error',
      status: 500,
      statusText: 'Internal Server Error',
    });
    expect(extractErrorMessage(err)).toBe('Błąd serwera. Spróbuj ponownie później.');
  });

  it('returns generic 502 message', () => {
    const err = new HttpErrorResponse({ error: '', status: 502 });
    expect(extractErrorMessage(err)).toBe('Błąd serwera. Spróbuj ponownie później.');
  });

  it('returns generic 503 message', () => {
    const err = new HttpErrorResponse({ error: '', status: 503 });
    expect(extractErrorMessage(err)).toBe('Błąd serwera. Spróbuj ponownie później.');
  });

  it('returns generic 504 message', () => {
    const err = new HttpErrorResponse({ error: '', status: 504 });
    expect(extractErrorMessage(err)).toBe('Błąd serwera. Spróbuj ponownie później.');
  });

  it('returns generic 404 message', () => {
    const err = new HttpErrorResponse({ error: '', status: 404 });
    expect(extractErrorMessage(err)).toBe('Nie znaleziono zasobu.');
  });

  it('returns generic 400 message', () => {
    const err = new HttpErrorResponse({ error: '', status: 400 });
    expect(extractErrorMessage(err)).toBe('Nieprawidłowe żądanie.');
  });

  it('returns default with status for unknown codes', () => {
    const err = new HttpErrorResponse({ error: '', status: 418 });
    expect(extractErrorMessage(err)).toBe('Wystąpił błąd (418).');
  });

  it('returns status 0 message', () => {
    const err = new HttpErrorResponse({ error: new ErrorEvent('error'), status: 0 });
    // Falls through to ErrorEvent handler
    const msg = extractErrorMessage(err);
    expect(msg).toBe('Błąd połączenia z serwerem.');
  });
});

describe('handleHttpError', () => {
  it('calls handle() with extracted message for HttpErrorResponse', () => {
    const mock = { handle: vi.fn(), handleImmediate: vi.fn() };
    const err = new HttpErrorResponse({
      error: 'Server error',
      status: 500,
      statusText: 'Internal Server Error',
    });

    const result$ = handleHttpError(err, mock as unknown as ErrorHandlingService);

    expect(mock.handle).toHaveBeenCalledTimes(1);
    expect(mock.handle).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Błąd serwera. Spróbuj ponownie później.' }),
    );

    // The returned observable errors
    let caught: unknown;
    result$.subscribe({ error: (e) => { caught = e; } });
    expect(caught).toBe(err);
  });

  it('does not call handle() for non-HttpErrorResponse', () => {
    const mock = { handle: vi.fn(), handleImmediate: vi.fn() };
    const domainError = new Error('Domain error');

    const result$ = handleHttpError(domainError, mock as unknown as ErrorHandlingService);

    expect(mock.handle).not.toHaveBeenCalled();

    // Error is re-thrown
    let caught: unknown;
    result$.subscribe({ error: (e) => { caught = e; } });
    expect(caught).toBe(domainError);
  });

  it('does not call handle() for non-Error types', () => {
    const mock = { handle: vi.fn(), handleImmediate: vi.fn() };
    const stringError = 'just a string';

    handleHttpError(stringError, mock as unknown as ErrorHandlingService);

    expect(mock.handle).not.toHaveBeenCalled();
  });
});
