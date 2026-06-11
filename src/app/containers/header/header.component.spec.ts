import { Component, input, output, provideZonelessChangeDetection, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { LocationFacade } from '../../services/location.facade';

@Component({
  selector: 'termo-refresh-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class RefreshButtonStub {
  progress = input<number>();
  refreshing = input<boolean>();
  refresh = output();
}

describe('HeaderComponent', () => {
  const mockFacade = {
    refreshProgress: signal(0),
    refreshing: signal(false),
    manualRefresh: vi.fn(),
  };

  function setup() {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(HeaderComponent, {
      set: { imports: [RefreshButtonStub] },
    });

    const fixture = TestBed.createComponent(HeaderComponent);

    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('passes refreshProgress and refreshing to refresh-button', () => {
    const { fixture } = setup();
    mockFacade.refreshProgress.set(0.5);
    mockFacade.refreshing.set(true);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('termo-refresh-button'));
    const button = buttonEl.componentInstance as RefreshButtonStub;

    expect(button.progress()).toBe(0.5);
    expect(button.refreshing()).toBe(true);
  });

  it('calls locationFacade.manualRefresh on refresh()', () => {
    const { fixture } = setup();

    fixture.componentInstance.refresh();

    expect(mockFacade.manualRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders the termo-refresh-button child', () => {
    const { fixture } = setup();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('termo-refresh-button')).toBeTruthy();
  });
});
