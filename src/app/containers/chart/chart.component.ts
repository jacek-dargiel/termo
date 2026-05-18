import { Component, HostBinding, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { LocationFacade } from '../../services/location.facade';
import { Location } from '../../interfaces';
import { Measurement } from '../../interfaces';
import { format } from 'date-fns';
import { LineChartComponent } from '@glitchtip/ng-charts';

@Component({
  selector: 'termo-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  imports: [LineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  protected readonly facade = inject(LocationFacade);

  @HostBinding('class.chart--visible')
  get visible(): boolean {
    return this.facade.selectedLocation() !== null;
  }

  readonly chartData = computed(() => {
    const location = this.facade.selectedLocation();
    const measurements = this.facade.selectedLocationMeasurements();
    if (!location) return undefined;
    if (!measurements || measurements.length === 0) return undefined;
    return this.mapMeasurementToChartDataPoint(location, measurements);
  });

  close(): void {
    this.facade.closeChart();
  }

  mapMeasurementToChartDataPoint(location: Location, measurements: Measurement[]) {
    return [{
      name: location.name,
      series: measurements.map(measurement => ({
        name: measurement.created_at,
        value: measurement.value,
      })),
    }];
  }

  formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }
}
