import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { ChartFacade } from './chart.facade';
import { Subscription } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { Measurment } from '../../state/measurment/measurment.model';
import { ErrorHandlingService } from '../../services/error-handling.service';
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
    private errorHandlingService: ErrorHandlingService,
  ) { }

  ngOnInit() {
    this.selectedLocationSub = this.chartFacade.selectedLocation$
      .pipe(
        tap(location => {
          this.location = location;
        }),
        switchMap(() => this.chartFacade.selectedLocationMeasurments$),
        tap(measurments => {
          this.visible = measurments.length > 0;
          if (this.location && (measurments.length === 0)) {
            this.errorHandlingService.handle(new Error('Brak danych do wyświetlenia na wykresie.'));
          }
        }),
        filter(measurments => measurments.length > 0),
        map(measurments => this.mapMeasurmentToChartDataPoint(measurments)),
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
