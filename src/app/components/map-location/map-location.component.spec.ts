import { Component, provideZonelessChangeDetection, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { MapLocationComponent } from './map-location.component';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
import { TERMO_CURRENT_TIME_FACTORY } from '../../pipes/current-time.injection-token';
import { LocationWithKeyMeasurementValues } from '../../interfaces';

const MOCK_NOW = new Date('2026-04-25T12:00:00Z');

@Component({
  selector: 'termo-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div data-testid="spinner-stub"></div>',
})
class StubSpinnerComponent {}

function createMockLocation(overrides?: Partial<LocationWithKeyMeasurementValues>): LocationWithKeyMeasurementValues {
  return {
    id: 'loc-1',
    name: 'Living Room',
    mapPosition: { x: 0.5, y: 0.3 },
    updatedAt: new Date('2026-04-25T11:59:00Z'),
    lastMeasurementValue: 22.5,
    minimalMeasurementValue: 18.3,
    ...overrides,
  };
}

describe('MapLocationComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [MapLocationComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => MOCK_NOW },
      ],
    });

    TestBed.overrideComponent(MapLocationComponent, {
      set: { imports: [StubSpinnerComponent, IsLocationOutdatedPipe, RelativeTimePipe, ToFixedPipe] },
    });

    const fixture = TestBed.createComponent(MapLocationComponent);
    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('location', createMockLocation());
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('rendering: loading state', () => {
    it('shows the spinner when loading is true', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="spinner-stub"]')).toBeTruthy();
      expect(el.querySelector('[data-testid="location-card"]')).toBeFalsy();
    });

    it('hides the spinner and shows the location card when loading is false', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="spinner-stub"]')).toBeFalsy();
      expect(el.querySelector('[data-testid="location-card"]')).toBeTruthy();
    });
  });

  describe('rendering: location data', () => {
    it('displays the location name', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation({ name: 'Kitchen' }));
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const nameEl = el.querySelector('[data-testid="location-name"]');
      expect(nameEl?.textContent).toBe('Kitchen');
    });

    it('displays the formatted temperature with °C unit', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation({ lastMeasurementValue: 22.5 }));
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const tempEl = el.querySelector('[data-testid="location-temperature"]');
      expect(tempEl?.textContent).toContain('22');
      expect(el.textContent).toContain('°C');
    });

    it('shows the minimal temperature section when minimalMeasurementValue is not null', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation({ minimalMeasurementValue: 18.3 }));
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="location-minimal-temperature"]')).toBeTruthy();
      expect(el.querySelector('[data-testid="location-minimal-value"]')).toBeTruthy();
    });

    it('hides the minimal temperature section when minimalMeasurementValue is null', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation({ minimalMeasurementValue: null }));
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="location-minimal-temperature"]')).toBeFalsy();
    });
  });

  describe('rendering: outdated warning', () => {
    it('shows the outdated warning when updatedAt is older than the threshold', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput(
        'location',
        createMockLocation({ updatedAt: new Date('2026-04-25T11:44:00Z') }),
      );
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="location-outdated"]')).toBeTruthy();
    });

    it('hides the outdated warning when updatedAt is within the threshold', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput(
        'location',
        createMockLocation({ updatedAt: new Date('2026-04-25T11:59:00Z') }),
      );
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('[data-testid="location-outdated"]')).toBeFalsy();
    });

    it('displays relative time in the outdated warning', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput(
        'location',
        createMockLocation({ updatedAt: new Date('2026-04-25T11:30:00Z') }),
      );
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const outdatedEl = el.querySelector('[data-testid="location-outdated"]');
      expect(outdatedEl?.textContent).toContain('30 min.');
    });
  });

  describe('arrow', () => {
    it('always renders the arrow div, even when loading', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.arrow')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('renders the location card with role group and aria-label', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const card: HTMLElement | null = fixture.nativeElement.querySelector('[data-testid="location-card"]');
      expect(card?.getAttribute('role')).toBe('group');
      expect(card?.getAttribute('aria-label')).toBe('location-card');
    });
  });

  describe('HostBinding: position', () => {
    it('sets right and bottom as percentage styles based on mapPosition', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput(
        'location',
        createMockLocation({ mapPosition: { x: 0.7, y: 0.4 } }),
      );
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.style.right).toBe('30%');
      expect(host.style.bottom).toBe('60%');
    });

    it('adjustPosition calculates edge positions correctly', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput(
        'location',
        createMockLocation({ mapPosition: { x: 0, y: 0 } }),
      );
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.style.right).toBe('100%');
      expect(host.style.bottom).toBe('100%');
    });
  });

  describe('HostBinding: selected class', () => {
    it('adds location--selected class to host when selected is true', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', false);
      fixture.componentInstance.selected = true;
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.classList.contains('location--selected')).toBe(true);
    });

    it('does not add location--selected class when selected is false', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('location', createMockLocation());
      fixture.componentRef.setInput('loading', false);
      fixture.componentInstance.selected = false;
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.classList.contains('location--selected')).toBe(false);
    });
  });

  describe('HostListener: click', () => {
    it('emits selectLocation output with the location on host click', () => {
      const { fixture } = setup();
      const mockLocation = createMockLocation();
      fixture.componentRef.setInput('location', mockLocation);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const emitted = vi.fn();
      fixture.componentInstance.selectLocation.subscribe(emitted);

      (fixture.nativeElement as HTMLElement).click();

      expect(emitted).toHaveBeenCalledTimes(1);
      expect(emitted).toHaveBeenCalledWith(mockLocation);
    });
  });
});
