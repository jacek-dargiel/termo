import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChartComponent } from './chart.component';
import { ChartFacade } from './chart.facade';
import { ReplaySubject } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { Measurment } from '../../state/measurment/measurment.model';
import { LineChartModule } from '@swimlane/ngx-charts';

let mockLocation: Location = {
  id: 'temperatura.gorny_tunel',
  name: 'Górny Tunel',
  mapPosition: {
    x: 0.25,
    y: 0.75,
  },
  updatedAt: new Date('2018-09-19T23:45:00'),
};
let mockLocation2: Location = {
  id: 'temperatura.dolny_tunel',
  name: 'Dolny Tunel',
  mapPosition: {
    x: 0.5,
    y: 0.5,
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
  public selectedLocation$ = new ReplaySubject<Location>();
  public selectedLocationMeasurments$ = new ReplaySubject<Measurment[]>();

  constructor() {
    this.selectedLocation$.next(mockLocation);
    this.selectedLocationMeasurments$.next(mockMeasurmnets);
  }

  public closeChart() {
    this.selectedLocation$.next(undefined);
  }
}

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let facade: MockChartFacade;

  beforeEach(waitForAsync(() => {
    facade = new MockChartFacade();

    TestBed.configureTestingModule({
      imports: [ ChartComponent ],
      providers: [
        { provide: ChartFacade, useValue: facade }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ChartComponent, { remove: { imports: [LineChartModule]}})
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
  it('should render chart', () => {
    expect(fixture).toMatchSnapshot();
  });
  it('should hide chart when closed', () => {
    component.close();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should render new location when location changes', () => {
    facade.selectedLocation$.next(mockLocation2);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  // it('should render new measurments when measurments change', () => {
  //   facade.selectedLocationMeasurments$.next(mockMeasurmnets2);
  //   fixture.detectChanges();
  //   let chart = fixture.debugElement.query(By.css('ngx-charts-line-chart'));
  // });
});
