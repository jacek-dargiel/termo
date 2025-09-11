import { TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './containers/map/map.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { ChartComponent } from './containers/chart/chart.component';
describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AppComponent, { remove: { imports: [MapComponent, ChartComponent, SnackbarComponent]}})
      .compileComponents();
  }));
  it('should create the app', waitForAsync(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
