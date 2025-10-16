import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapComponent } from './containers/map/map.component';
import { ChartComponent } from './containers/chart/chart.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';

@Component({
    selector: 'termo-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MapComponent, ChartComponent, SnackbarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'termo';
}
