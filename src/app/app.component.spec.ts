import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './containers/map/map.component';
import { ChartComponent } from './containers/chart/chart.component';
import { ErrorHandlingService } from './services/error-handling.service';
describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideZonelessChangeDetection(), ErrorHandlingService]
    })
      .overrideComponent(AppComponent, { remove: { imports: [MapComponent, ChartComponent ]}})
      .compileComponents();
  });
  it('should create the app', () => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
