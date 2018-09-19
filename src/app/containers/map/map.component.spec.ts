import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MapComponent } from './map.component';
import { MapLocationComponent } from '../../components/map-location/map-location.component';
import { MapFacade } from './map.facade';
import { Observable, of } from 'rxjs';
import { LocationWithKeyMeasurmentValues, Location } from '../../state/location/location.model';
import { ToFixedPipe } from '../../to-fixed.pipe';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

class MockMapFacade {
  public locationsLoading$: Observable<boolean>;
  public locations$: Observable<LocationWithKeyMeasurmentValues>;
  public selectedLocation$: Observable<Location>;

  public dispatchMapInit() {}
  public getImageDimentions() {
    return of({width: 800, height: 600});
  }
  public selectLocation(location: Location) {}
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapComponent,
        MapLocationComponent,
        ToFixedPipe,
        IsLocationOutdatedPipe,
        RelativeTimePipe,
      ],
      providers: [
        { provide: MapFacade, useClass: MockMapFacade },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
