import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MapLocationComponent } from './map-location.component';
import { ToFixedPipe } from '../../to-fixed.pipe';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
