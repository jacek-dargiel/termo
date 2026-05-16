import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ErrorHandlingService } from './error-handling.service';
import { HotToastService } from '@ngxpert/hot-toast';

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

  it('creates an instance', () => {
    const { service } = setup();

    expect(service).toBeTruthy();
  });

  it('calls toast.error with the error message when handle is called', () => {
    const { service, mockToast } = setup();
    const error = new Error('Connection failed');

    service.handle(error);

    expect(mockToast.error).toHaveBeenCalledWith('Connection failed', { icon: '' });
  });

  it('calls toast.error for each error when handle is called multiple times', () => {
    const { service, mockToast } = setup();

    service.handle(new Error('First error'));
    service.handle(new Error('Second error'));

    expect(mockToast.error).toHaveBeenCalledTimes(2);
    expect(mockToast.error).toHaveBeenNthCalledWith(1, 'First error', { icon: '' });
    expect(mockToast.error).toHaveBeenNthCalledWith(2, 'Second error', { icon: '' });
  });

  it('does not call toast.error before handle is called', () => {
    const { mockToast } = setup();

    expect(mockToast.error).not.toHaveBeenCalled();
  });
});
