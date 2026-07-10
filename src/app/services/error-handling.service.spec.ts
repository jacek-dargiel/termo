import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { ErrorHandlingService } from './error-handling.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from 'environments/environment';

// Must be top-level (outside describe). Vitest hoists it.
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  showReportDialog: vi.fn(),
}));

describe('ErrorHandlingService', () => {
  function setup() {
    const mockToast = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlingService,
        { provide: HotToastService, useValue: mockToast },
      ],
    });

    const service = TestBed.inject(ErrorHandlingService);
    return { service, mockToast };
  }

  afterEach(() => {
    // no global cleanup needed
  });

  it('creates an instance', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  describe('handle (throttled)', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not show toast immediately', () => {
      const { service, mockToast } = setup();

      service.handle(new Error('Test error'));

      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it('shows toast after auditTime window expires', () => {
      vi.useFakeTimers();
      const { service, mockToast } = setup();

      service.handle(new Error('Delayed error'));

      vi.advanceTimersByTime(environment.snackbarDefaultTimeout);

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('Delayed error', { icon: '' });
    });

    it('coalesces multiple calls within the window — only the last error toasts', () => {
      vi.useFakeTimers();
      const { service, mockToast } = setup();

      service.handle(new Error('First error'));
      service.handle(new Error('Second error'));

      vi.advanceTimersByTime(environment.snackbarDefaultTimeout);

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('Second error', { icon: '' });
    });

    it('multiple calls in separate windows each produce a toast', () => {
      vi.useFakeTimers();
      const { service, mockToast } = setup();

      service.handle(new Error('First'));
      vi.advanceTimersByTime(environment.snackbarDefaultTimeout);
      expect(mockToast.error).toHaveBeenCalledTimes(1);

      service.handle(new Error('Second'));
      vi.advanceTimersByTime(environment.snackbarDefaultTimeout);
      expect(mockToast.error).toHaveBeenCalledTimes(2);
    });

    it('does not call toast.error before any handle call', () => {
      const { mockToast } = setup();
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });

  describe('handleImmediate (unthrottled)', () => {
    it('shows toast immediately on call', () => {
      const { service, mockToast } = setup();

      service.handleImmediate(new Error('Validation error'));

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('Validation error', { icon: '' });
    });

    it('shows every call — no coalescing', () => {
      const { service, mockToast } = setup();

      service.handleImmediate(new Error('First'));
      service.handleImmediate(new Error('Second'));

      expect(mockToast.error).toHaveBeenCalledTimes(2);
    });
  });
});
