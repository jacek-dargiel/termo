import { Component, OnInit, HostBinding, OnDestroy, inject } from '@angular/core';
import { ChartFacade } from './chart.facade';
import { Subscription } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { map, filter } from 'rxjs/operators';
import { Measurment } from '../../state/measurment/measurment.model';
import { format } from 'date-fns';

@Component({
    selector: 'termo-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    standalone: false
})
export class ChartComponent implements OnInit, OnDestroy {
  private chartFacade = inject(ChartFacade);

  @HostBinding('class.chart--visible') visible = false;
  selectedLocationSub: Subscription;
  locationMeasurmentsSub: Subscription;
  measurmentsSub: Subscription;
  location: Location;
  chartData;

  ngOnInit() {
    this.selectedLocationSub = this.chartFacade.selectedLocation$
      .subscribe(location => {
        this.location = location;
        this.visible = Boolean(location);
      });

    this.locationMeasurmentsSub = this.chartFacade.selectedLocationMeasurments$
      .pipe(
        filter(measurments => measurments !== undefined),
        map(measuments => this.mapMeasurmentToChartDataPoint(measuments))
      )
      .subscribe(data => {
        this.chartData = data;
      });
  }

  ngOnDestroy() {
    if (this.selectedLocationSub) {
      this.selectedLocationSub.unsubscribe();
    }
    if (this.locationMeasurmentsSub) {
      this.locationMeasurmentsSub.unsubscribe();
    }
  }

  close() {
    this.chartFacade.closeChart();
  }

  mapMeasurmentToChartDataPoint(measurments: Measurment[]) {
    let data = {
      name: this.location.name,
      series: measurments.map(measurment => ({
        name: measurment.created_at,
        value: measurment.value,
      })),
    };
    return [data];
  }

  formatTime(date: Date) {
    return format(date, 'HH:mm');
  }

}
