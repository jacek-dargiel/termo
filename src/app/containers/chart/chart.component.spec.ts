import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChartComponent } from './chart.component';
import { ChartFacade } from './chart.facade';
import { Observable, of } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { Measurment } from '../../state/measurment/measurment.model';

let mockLocation: Location = {
  id: 'temperatura.gorny_tunel',
  name: 'Górny Tunel',
  mapPosition: {
    x: 0.25,
    y: 0.75,
  },
  updatedAt: new Date('2018-09-19T23:45:00'),
};
let mockMeasurmnets: Measurment[] = [
  {
    id: '123',
    value: 21.05,
    created_at: new Date('2018-09-19T23:47:00'),
    feed_id: 1234,
    feed_key: 'temperatura.gorny_tunel',
  },
  {
    id: '124',
    value: 20.33,
    created_at: new Date('2018-09-19T23:55:00'),
    feed_id: 1234,
    feed_key: 'temperatura.gorny_tunel',
  }
];

class MockChartFacade {
  public selectedLocation$: Observable<Location> = of(mockLocation);
  public selectedLocationMeasurments$: Observable<Measurment[]> = of(mockMeasurmnets);

  public closeChart() {}
}

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartComponent ],
      providers: [
        { provide: ChartFacade, useClass: MockChartFacade }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
