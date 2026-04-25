import { AsyncPipe } from '@angular/common';
import { Component, input, output, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cold, schedule } from '@granito/vitest-marbles';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { HeaderFacade } from './header.facade';

@Component({
  selector: 'termo-refresh-button',
  template: '',
})
class RefreshButtonStub {
  progress = input<number>();
  refreshing = input<boolean>();
  refresh = output();
}

describe('HeaderComponent', () => {
  function setup() {
    const progress$ = new BehaviorSubject<number>(0);
    const refreshing$ = new BehaviorSubject<boolean>(false);
    const refresh = vi.fn();

    const mockFacade = {
      progress: progress$.asObservable(),
      refreshing: refreshing$.asObservable(),
      refresh,
    };

    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: HeaderFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(HeaderComponent, {
      set: { imports: [RefreshButtonStub, AsyncPipe] },
    });

    const fixture = TestBed.createComponent(HeaderComponent);

    return { fixture, progress$, refreshing$, refresh };
  }

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes progress$ from the facade', () => {
    const { fixture, progress$ } = setup();

    const expected = cold('ab', { a: 0, b: 0.5 });
    schedule(() => progress$.next(0.5), 10);

    expect(fixture.componentInstance.progress$).toBeObservable(expected);
  });

  it('exposes refreshing$ from the facade', () => {
    const { fixture, refreshing$ } = setup();

    const expected = cold('ab', { a: false, b: true });
    schedule(() => refreshing$.next(true), 10);

    expect(fixture.componentInstance.refreshing$).toBeObservable(expected);
  });

  it('calls facade.refresh() on refresh()', () => {
    const { fixture, refresh } = setup();

    fixture.componentInstance.refresh();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('renders the termo-refresh-button child', () => {
    const { fixture } = setup();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('termo-refresh-button')).toBeTruthy();
  });
});
