import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapComponent } from './containers/map/map.component';
import { ChartComponent } from './containers/chart/chart.component';

@Component({
    selector: 'termo-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MapComponent, ChartComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'termo';
}
