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
  private readonly locationFacade = inject(LocationFacade);

  readonly selectedLocation = computed(() => this.locationFacade.selectedLocation());
  readonly selectedLocationMeasurements = computed(() => this.locationFacade.selectedLocationMeasurements());

  @HostBinding('class.chart--visible')
  get visible(): boolean {
    return this.selectedLocation() !== null;
  }

  readonly chartData = computed(() => {
    const location = this.selectedLocation();
    const measurements = this.selectedLocationMeasurements();
    if (!location) return undefined;
    if (!measurements || measurements.length === 0) return undefined;
    return this.mapMeasurementToChartDataPoint(location, measurements);
  });

  close(): void {
    this.locationFacade.closeChart();
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
