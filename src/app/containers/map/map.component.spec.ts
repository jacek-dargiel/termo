import { AsyncPipe } from '@angular/common';
import { Component, input, output, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MapComponent } from './map.component';
import { MapFacade } from './map.facade';
import { Location } from '../../state/location/location.model';

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

function createLocation(overrides?: Partial<Location>): Location {
  return {
    id: 'loc-1',
    name: 'Living Room',
    mapPosition: { x: 0.5, y: 0.3 },
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('MapComponent', () => {
  function setup() {
    const loading$ = new BehaviorSubject<boolean>(false);
    const locations$ = new BehaviorSubject<Location[]>([]);
    const selectedLocation$ = new BehaviorSubject<Location | undefined>(undefined);
    const getImageDimentions$ = new Subject<{ width: number; height: number }>();
    const dispatchMapInit = vi.fn();
    const selectLocation = vi.fn().mockReturnValue(of(undefined));
    const getImageDimentions = vi.fn().mockReturnValue(getImageDimentions$);

    const mockFacade = {
      loading$: loading$.asObservable(),
      locations$: locations$.asObservable(),
      selectedLocation$: selectedLocation$.asObservable(),
      dispatchMapInit,
      getImageDimentions,
      selectLocation,
    };

    TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MapFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(MapComponent, {
      set: { imports: [HeaderStub, MapLocationStub, AsyncPipe] },
    });

    const fixture = TestBed.createComponent(MapComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      loading$,
      locations$,
      selectedLocation$,
      getImageDimentions$,
      dispatchMapInit,
      getImageDimentions,
      selectLocation,
    };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates the component', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('exposes loading$, locations$, and selectedLocation$ observables from the facade', () => {
    const { component, loading$, locations$, selectedLocation$ } = setup();
    const location = createLocation();

    loading$.next(true);
    locations$.next([location]);
    selectedLocation$.next(location);

    expect(component.loading$).toBeDefined();
    expect(component.locations$).toBeDefined();
    expect(component.selectedLocation$).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('dispatches MapInitialized action via the facade', () => {
      const { dispatchMapInit } = setup();

      expect(dispatchMapInit).toHaveBeenCalledOnce();
    });

    it('calls getImageDimentions on the facade', () => {
      const { getImageDimentions } = setup();

      expect(getImageDimentions).toHaveBeenCalledOnce();
    });

    it('subscribes to image dimensions and updates --mapBackgroundRatio CSS property', () => {
      const { getImageDimentions$, fixture } = setup();

      getImageDimentions$.next({ width: 800, height: 600 });

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
    it('calls mapFacade.selectLocation with the given location', () => {
      const { component, selectLocation } = setup();
      const location = createLocation();

      component.onLocationSelect(location);

      expect(selectLocation).toHaveBeenCalledWith(location);
    });

    it('calls mapFacade.selectLocation when a child component emits selectLocation', () => {
      const { locations$, selectLocation, fixture } = setup();
      const location = createLocation();

      locations$.next([location]);
      fixture.detectChanges();

      const childComponent = fixture.debugElement
        .query(By.css('termo-map-location'))
        .componentInstance as MapLocationStub;
      childComponent.selectLocation.emit(location);

      expect(selectLocation).toHaveBeenCalledWith(location);
    });
  });
});
