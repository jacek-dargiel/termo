import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { ChartFacade } from './chart.facade';
import { Subscription } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { map, switchMapTo, tap, filter } from 'rxjs/operators';
import { Measurment } from '../../state/measurment/measurment.model';
import { format } from 'date-fns/esm';

@Component({
  selector: 'termo-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {
  @HostBinding('class.chart--visible') visible = false;
  selectedLocationSub: Subscription;
  measurmentsSub: Subscription;
  location: Location;
  chartData;

  constructor(
    private chartFacade: ChartFacade,
  ) { }

  ngOnInit() {
    this.selectedLocationSub = this.chartFacade.selectedLocation$
      .pipe(
        tap(location => {
          this.location = location;
          this.visible = Boolean(location);
        }),
        switchMapTo(this.chartFacade.selectedLocationMeasurments$),
        filter(measurments => measurments !== undefined),
        map(measurments => {
          return this.mapMeasurmentToChartDataPoint(measurments);
        }),
      )
      .subscribe(data => {
        this.chartData = data;
      });
  }

  ngOnDestroy() {
    if (this.selectedLocationSub) {
      this.selectedLocationSub.unsubscribe();
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