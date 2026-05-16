import { Component, OnInit, HostBinding, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChartFacade } from './chart.facade';
import { Subscription } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { map, filter } from 'rxjs/operators';
import { Measurement } from '../../state/measurement/measurement.model';
import { format } from 'date-fns';
import { LineChartComponent } from '@glitchtip/ng-charts';

@Component({
    selector: 'termo-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    imports: [LineChartComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnDestroy {
  private chartFacade = inject(ChartFacade);
  private cdr = inject(ChangeDetectorRef);

  @HostBinding('class.chart--visible') visible = false;
  selectedLocationSub: Subscription;
  locationMeasurementsSub: Subscription;
  measurementsSub: Subscription;
  location: Location;
  chartData;

  ngOnInit() {
    this.selectedLocationSub = this.chartFacade.selectedLocation$
      .subscribe(location => {
        this.location = location;
        this.visible = Boolean(location);
        this.cdr.markForCheck();
      });

    this.locationMeasurementsSub = this.chartFacade.selectedLocationMeasurements$
      .pipe(
        filter(measurements => measurements !== undefined),
        map(measurements => this.mapMeasurementToChartDataPoint(measurements))
      )
      .subscribe(data => {
        this.chartData = data;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.selectedLocationSub) {
      this.selectedLocationSub.unsubscribe();
    }
    if (this.locationMeasurementsSub) {
      this.locationMeasurementsSub.unsubscribe();
    }
  }

  close() {
    this.chartFacade.closeChart();
  }

  mapMeasurementToChartDataPoint(measurements: Measurement[]) {
    let data = {
      name: this.location.name,
      series: measurements.map(measurement => ({
        name: measurement.created_at,
        value: measurement.value,
      })),
    };
    return [data];
  }

  formatTime(date: Date) {
    return format(date, 'HH:mm');
  }

}
