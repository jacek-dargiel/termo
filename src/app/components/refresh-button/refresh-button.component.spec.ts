import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { RefreshButtonComponent } from './refresh-button.component';

describe('RefreshButtonComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RefreshButtonComponent],
      providers: [provideZonelessChangeDetection()],
    });

    const fixture = TestBed.createComponent(RefreshButtonComponent);

    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits refresh output when onRefreshClick is called', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    const emitted = vi.fn();
    component.refresh.subscribe(emitted);

    component.onRefreshClick();

    expect(emitted).toHaveBeenCalledTimes(1);

    component.onRefreshClick();
    expect(emitted).toHaveBeenCalledTimes(2);
  });

  it('sets the progress bar width based on the progress input', () => {
    const { fixture } = setup();

    fixture.componentRef.setInput('progress', 0.42);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const progressBar = el.querySelector('.refresh__progress') as HTMLElement;

    expect(progressBar.style.width).toBe('42%');
  });

  it('shows the progress bar at 0% when progress is not set', () => {
    const { fixture } = setup();

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const progressBar = el.querySelector('.refresh__progress') as HTMLElement;

    expect(progressBar.style.width).toBe('0%');
  });

  it('toggles the refreshing class when the refreshing input changes', () => {
    const { fixture } = setup();

    fixture.componentRef.setInput('refreshing', true);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const progressBar = el.querySelector('.refresh__progress') as HTMLElement;
    expect(progressBar.classList.contains('refresh__progress--refreshing')).toBe(true);

    fixture.componentRef.setInput('refreshing', false);
    fixture.detectChanges();
    expect(progressBar.classList.contains('refresh__progress--refreshing')).toBe(false);
  });

  describe('with projected content', () => {
    @Component({
      template: `<termo-refresh-button>Projected Label</termo-refresh-button>`,
      imports: [RefreshButtonComponent],
    })
    class TestHost {}

    it('renders projected content inside the label span', () => {
      TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [provideZonelessChangeDetection()],
      });

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const label = el.querySelector('.refresh__label');

      expect(label?.textContent?.trim()).toBe('Projected Label');
    });
  });
});
