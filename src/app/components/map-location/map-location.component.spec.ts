import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLocationComponent } from './map-location.component';
import { ToFixedPipe } from '../../to-fixed.pipe';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';

describe('MapLocationComponent', () => {
  let component: MapLocationComponent;
  let fixture: ComponentFixture<MapLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapLocationComponent,
        ToFixedPipe,
        IsLocationOutdatedPipe,
      ]
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
