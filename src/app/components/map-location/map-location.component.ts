import { Component, Input, HostBinding, OnInit, HostListener, input, output } from '@angular/core';
import { LocationWithKeyMeasurmentValues, Location } from '../../state/location/location.model';

@Component({
    selector: 'termo-map-location',
    templateUrl: './map-location.component.html',
    styleUrls: ['./map-location.component.scss'],
    standalone: false
})
export class MapLocationComponent implements OnInit {
  readonly location = input<LocationWithKeyMeasurmentValues>();
  readonly loading = input<boolean>();
  @Input()
  @HostBinding('class.location--selected')
  selected: boolean;
  readonly selectLocation = output<Location>();
  @HostBinding('style.bottom.%') bottom: number;
  @HostBinding('style.right.%') right: number;

  constructor(
  ) { }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.right = 100 - (this.location().mapPosition.x * 100);
    this.bottom = 100 - (this.location().mapPosition.y * 100);
  }

  @HostListener('click')
  selectLocationEntities() {
    this.selectLocation.emit(this.location());
  }

}
