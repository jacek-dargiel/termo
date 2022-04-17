import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, Input, HostBinding, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MapComponent } from './map.component';
import { MapFacade } from './map.facade';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { LocationWithKeyMeasurmentValues, Location } from '../../state/location/location.model';
import { By } from '@angular/platform-browser';

class MockMapFacade {
  public locationsLoading$ = new BehaviorSubject<string[]>([]);
  public locations$ = new BehaviorSubject<LocationWithKeyMeasurmentValues[]>([]);
  public selectedLocation$ = new Subject<Location>();

  public dispatchMapInit = jest.fn();
  public selectLocation = jest.fn(() => of());

  public getImageDimentions = jest.fn(() => {
    return of({width: 800, height: 600});
  });
}

let mockLocations: LocationWithKeyMeasurmentValues[] = [
  {
    id: 'temperatura.gorny_tunel',
    name: 'Górny Tunel',
    mapPosition: {
      x: 0.25,
      y: 0.75,
    },
    updatedAt: new Date('2018-09-19T22:10:00'),
    lastMeasurmentValue: 21.12,
    minimalMeasurmentValue: 19.5,
  },
  {
    id: 'temperatura.dolny_tunel',
    name: 'Dolny Tunel',
    mapPosition: {
      x: 0.5,
      y: 0.5,
    },
    updatedAt: new Date('2018-09-19T22:10:00'),
    lastMeasurmentValue: 15,
    minimalMeasurmentValue: -5,
  },
];

@Component({
  selector: 'termo-map-location',
  template: ``,
})
export class MockMapLocationComponent {
  @Input() location: LocationWithKeyMeasurmentValues;
  @Input() loading: boolean;
  @Input()
  @HostBinding('class.location--selected')
  selected: boolean;
  @Output() select = new EventEmitter<Location>();
}


describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let facade: MockMapFacade;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapComponent,
        MockMapLocationComponent,
      ],
      providers: [
        { provide: MapFacade, useClass: MockMapFacade },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    component.updateMapRatio = jest.fn(component.updateMapRatio);
    facade = TestBed.get(MapFacade);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly render initial state', () => {
    expect(fixture).toMatchSnapshot();
  });
  it('should render locations', () => {
    facade.locations$.next(mockLocations);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should render loading states', () => {
    facade.locations$.next(mockLocations);
    facade.locationsLoading$.next([
      'temperatura.gorny_tunel',
      'temperatura.dolny_tunel',
    ]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    facade.locationsLoading$.next([
      'temperatura.gorny_tunel',
    ]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    facade.locationsLoading$.next([
      'temperatura.dolny_tunel',
    ]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    facade.locationsLoading$.next([]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should dispatch map initialization action on init', () => {
    expect(facade.dispatchMapInit).toHaveBeenCalled();
  });

  it('should update map image dimentions on init', () => {
    expect(facade.getImageDimentions).toHaveBeenCalled();
    expect(component.updateMapRatio).toHaveBeenCalledWith({width: 800, height: 600});
  });

  it('should select location when clicked', () => {
    facade.locations$.next(mockLocations);
    fixture.detectChanges();
    let locationComp: MockMapLocationComponent = fixture.debugElement.query(By.css('termo-map-location')).componentInstance;
    locationComp.select.emit();
    fixture.detectChanges();
    expect(facade.selectLocation).toHaveBeenCalledWith(locationComp.location);
  });
});
