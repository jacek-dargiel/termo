import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { MDCSnackbar } from '@material/snackbar';

import { SnackbarComponent } from './snackbar.component';
import { SnackbarService, SnackbarData } from '../../services/snackbar.service';

let latestMockInstance: {
  labelText: string;
  timeoutMs: number;
  open: ReturnType<typeof vi.fn>;
};

vi.mock('@material/snackbar', () => ({
  MDCSnackbar: vi.fn(function () {
    latestMockInstance = {
      labelText: '',
      timeoutMs: 0,
      open: vi.fn(),
    };
    return latestMockInstance;
  }),
}));

describe('SnackbarComponent', () => {
  function setup() {
    const messages$ = new Subject<SnackbarData>();

    TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SnackbarService, useValue: { messages: messages$ } },
      ],
    });

    const fixture = TestBed.createComponent(SnackbarComponent);

    return { fixture, messages$ };
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(MDCSnackbar).mockClear();
  });

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('creates MDCSnackbar after view init', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    const mockMDCSnackbar = vi.mocked(MDCSnackbar);
    expect(mockMDCSnackbar).toHaveBeenCalledTimes(1);

    const snackbarElement = fixture.nativeElement.querySelector('.mdc-snackbar');
    expect(mockMDCSnackbar).toHaveBeenCalledWith(snackbarElement);
  });

  it('shows snackbar when a message is emitted', () => {
    const { fixture, messages$ } = setup();
    fixture.detectChanges();

    const data: SnackbarData = { message: 'Test message', timeout: 3000 };
    messages$.next(data);

    expect(latestMockInstance.labelText).toBe('Test message');
    expect(latestMockInstance.timeoutMs).toBe(3000);
    expect(latestMockInstance.open).toHaveBeenCalledTimes(1);
  });

  it('logs an error when message arrives before view init', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { messages$ } = setup();

    const data: SnackbarData = { message: 'Early message', timeout: 1000 };
    messages$.next(data);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Can\'t show snackbar before view init.', data);
    expect(vi.mocked(MDCSnackbar)).not.toHaveBeenCalled();
  });

  it('unsubscribes on destroy', () => {
    const { fixture, messages$ } = setup();
    fixture.detectChanges();

    messages$.next({ message: 'Message 1', timeout: 2000 });
    expect(latestMockInstance.open).toHaveBeenCalledTimes(1);

    fixture.destroy();

    messages$.next({ message: 'Message 2', timeout: 2000 });
    expect(latestMockInstance.open).toHaveBeenCalledTimes(1);
  });
});
