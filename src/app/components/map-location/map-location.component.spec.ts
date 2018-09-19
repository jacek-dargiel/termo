import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MapLocationComponent } from './map-location.component';
import { ToFixedPipe } from '../../to-fixed.pipe';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { LocationWithKeyMeasurmentValues } from '../../state/location/location.model';

describe('MapLocationComponent', () => {
  let component: MapLocationComponent;
  let fixture: ComponentFixture<MapLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapLocationComponent,
        ToFixedPipe,
        IsLocationOutdatedPipe,
        RelativeTimePipe,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLocationComponent);
    component = fixture.componentInstance;
    let testLocation: LocationWithKeyMeasurmentValues = {
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
    component.location = testLocation;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
