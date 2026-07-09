import { Component, Input, OnInit, input, output, ChangeDetectionStrategy } from '@angular/core';
import { LocationWithKeyMeasurementValues, Location } from '../../interfaces';
import { SpinnerComponent } from '../spinner/spinner.component';
import { IsLocationOutdatedPipe } from '../../pipes/is-location-outdated.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';

@Component({
    selector: 'termo-map-location',
    templateUrl: './map-location.component.html',
    styleUrls: ['./map-location.component.scss'],
    imports: [SpinnerComponent, IsLocationOutdatedPipe, RelativeTimePipe, ToFixedPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.location--selected]': 'selected',
        '[style.bottom.%]': 'bottom',
        '[style.right.%]': 'right',
        '(click)': 'selectLocationEntities()',
    },
})
export class MapLocationComponent implements OnInit {
  readonly location = input.required<LocationWithKeyMeasurementValues>();
  readonly loading = input<boolean>();
  @Input()
  selected!: boolean;
  readonly selectLocation = output<Location>();
  bottom!: number;
  right!: number;

  constructor(
  ) { }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.right = 100 - (this.location().mapPosition.x * 100);
    this.bottom = 100 - (this.location().mapPosition.y * 100);
  }

  selectLocationEntities() {
    this.selectLocation.emit(this.location());
  }

}
