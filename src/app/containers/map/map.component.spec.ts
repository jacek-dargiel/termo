import { Component, input, output, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { MapComponent } from './map.component';
import { LocationFacade } from '../../services/location.facade';
import { MapBackgroundService } from '../../services/map-background.service';
import { Location, LocationWithKeyMeasurementValues } from '../../interfaces';

@Component({
  selector: 'termo-header',
  template: '',
})
class HeaderStub {}

@Component({
  selector: 'termo-map-location',
  template: '',
})
class MapLocationStub {
  readonly location = input<Location>();
  readonly loading = input<boolean>();
  readonly selectLocation = output<Location>();
  selected = input<boolean>();
}

function createLocation(overrides?: Partial<LocationWithKeyMeasurementValues>): LocationWithKeyMeasurementValues {
  return {
    id: 'loc-1',
    name: 'Living Room',
    mapPosition: { x: 0.5, y: 0.3 },
    updatedAt: new Date(),
    lastMeasurementValue: 20.5,
    minimalMeasurementValue: 18.3,
    ...overrides,
  };
}

describe('MapComponent', () => {
  function setup() {
    const init = vi.fn().mockResolvedValue(undefined);
    const selectLocation = vi.fn();
    const getImageDimentions = vi.fn().mockReturnValue(of({ width: 800, height: 600 }));

    const mockFacade = {
      enrichedLocations: signal<LocationWithKeyMeasurementValues[]>([]),
      selectedLocation: signal<Location | null>(null),
      isLoading: signal(false),
      init,
      selectLocation,
    };

    const mockMapBg = {
      getImageDimentions,
    };

    TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationFacade, useValue: mockFacade },
        { provide: MapBackgroundService, useValue: mockMapBg },
      ],
    });

    TestBed.overrideComponent(MapComponent, {
      set: { imports: [HeaderStub, MapLocationStub] },
    });

    const fixture = TestBed.createComponent(MapComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      mockFacade,
      mockMapBg,
      init,
      selectLocation,
      getImageDimentions,
    };
  }

  it('creates the component', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('exposes isLoading, enrichedLocations, and selectedLocation', () => {
    const { component, mockFacade } = setup();
    const location = createLocation();

    mockFacade.isLoading.set(true);
    mockFacade.enrichedLocations.set([location]);
    mockFacade.selectedLocation.set(location);

    expect(component.isLoading()).toBe(true);
    expect(component.enrichedLocations()).toEqual([location]);
    expect(component.selectedLocation()).toBe(location);
  });

  describe('ngOnInit', () => {
    it('calls init on the LocationFacade', () => {
      const { init } = setup();

      expect(init).toHaveBeenCalledOnce();
    });

    it('calls getImageDimentions on MapBackgroundService', () => {
      const { getImageDimentions } = setup();

      expect(getImageDimentions).toHaveBeenCalledOnce();
    });

    it('subscribes to image dimensions and updates --mapBackgroundRatio CSS property', () => {
      const { fixture } = setup();

      expect(fixture.nativeElement.style.getPropertyValue('--mapBackgroundRatio')).toBe('0.75');
    });
  });

  describe('updateMapRatio', () => {
    it('sets --mapBackgroundRatio CSS custom property on the host element', () => {
      const { component, fixture } = setup();

      component.updateMapRatio({ width: 400, height: 300 });

      expect(fixture.nativeElement.style.getPropertyValue('--mapBackgroundRatio')).toBe('0.75');
    });

    it('handles zero-width input gracefully', () => {
      const { component, fixture } = setup();

      component.updateMapRatio({ width: 0, height: 100 });

      expect(fixture.nativeElement.style.getPropertyValue('--mapBackgroundRatio')).toBe('Infinity');
    });
  });

  describe('onLocationSelect', () => {
    it('calls LocationFacade.selectLocation with the given location', () => {
      const { component, selectLocation } = setup();
      const location = createLocation();

      component.onLocationSelect(location);

      expect(selectLocation).toHaveBeenCalledWith(location);
    });

    it('calls LocationFacade.selectLocation when a child component emits selectLocation', () => {
      const { mockFacade, selectLocation, fixture } = setup();
      const location = createLocation();

      mockFacade.enrichedLocations.set([location]);
      fixture.detectChanges();

      const childComponent = fixture.debugElement
        .query(By.css('termo-map-location'))
        .componentInstance as MapLocationStub;
      childComponent.selectLocation.emit(location);

      expect(selectLocation).toHaveBeenCalledWith(location);
    });
  });
});
