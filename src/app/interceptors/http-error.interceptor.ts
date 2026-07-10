import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorHandlingService } from '../services/error-handling.service';

/**
 * Extracts a user-facing Polish message from an HttpErrorResponse.
 * Exported for testing.
 */
export function extractErrorMessage(error: HttpErrorResponse): string {
  // Network error (client-side, no response received)
  if (error.error instanceof ErrorEvent) {
    return error.error.message || 'Błąd połączenia z serwerem.';
  }

  // Server responded with a JSON error body that has a message field
  if (error.error && typeof error.error === 'object' && 'message' in error.error) {
    return String(error.error.message);
  }

  // Fallback based on HTTP status
  switch (error.status) {
    case 0:
      return 'Brak połączenia z serwerem.';
    case 400:
      return 'Nieprawidłowe żądanie.';
    case 404:
      return 'Nie znaleziono zasobu.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Błąd serwera. Spróbuj ponownie później.';
    default:
      return `Wystąpił błąd (${error.status}).`;
  }
}

/**
 * Handles an HTTP error by calling the ErrorHandlingService.
 * Exported as a pure function for testing without Angular DI.
 */
export function handleHttpError(
  error: unknown,
  errorHandling: ErrorHandlingService,
): ReturnType<typeof throwError> {
  if (error instanceof HttpErrorResponse) {
    const message = extractErrorMessage(error);
    errorHandling.handle(new Error(message));
  }
  return throwError(() => error);
}

/**
 * Intercepts HTTP errors, displays a throttled toast, and re-throws the error
 * so upstream callers can use catchError to recover gracefully.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandling = inject(ErrorHandlingService);

  return next(req).pipe(
    catchError((error: unknown) => handleHttpError(error, errorHandling)),
  );
};
