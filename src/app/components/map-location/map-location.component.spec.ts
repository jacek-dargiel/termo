import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MapLocationComponent } from './map-location.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { LocationWithKeyMeasurmentValues } from '../../state/location/location.model';
import { TERMO_CURRENT_TIME_FACTORY } from '../../pipes/current-time.injection-token';

describe('MapLocationComponent', () => {
  let component: MapLocationComponent;
  let fixture: ComponentFixture<MapLocationComponent>;

  beforeEach(waitForAsync(() => {
    let since = new Date('2018-09-19T22:15:00');
    TestBed.configureTestingModule({
      declarations: [
        MapLocationComponent,
        ToFixedPipe,
        IsLocationOutdatedPipe,
        RelativeTimePipe,
      ],
      providers: [
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => since },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  let baseLocation: LocationWithKeyMeasurmentValues;
  beforeEach(() => {
    fixture = TestBed.createComponent(MapLocationComponent);
    component = fixture.componentInstance;
    baseLocation = {
      id: 'temperatura.gorny_tunel',
      name: 'Górny Tunel',
      mapPosition: {
        x: 0.25,
        y: 0.75,
      },
      updatedAt: new Date('2018-09-19T22:10:00'),
      lastMeasurmentValue: 21.12,
      minimalMeasurmentValue: 19.5,
    };
    component.location = baseLocation;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should properly render base state', () => {
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display outdated warning', () => {
    let testLocation = {
      ...baseLocation,
      updatedAt: new Date('2018-09-15T22:10:00'),
    };
    component.location = testLocation;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render selected state', () => {
    component.selected = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should position itself on the map element', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.styles.bottom).toBe('25%');
    expect(fixture.debugElement.styles.right).toBe('75%');
  });

  it('should emit `select` event on click', () => {
    let fakeSelectOutput = jest.spyOn(component.select, 'emit');
    fixture.debugElement.nativeElement.click();
    expect(fakeSelectOutput).toHaveBeenCalled();
  });
});
