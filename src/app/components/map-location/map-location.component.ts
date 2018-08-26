import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { LocationWithKeyMeasurmentValues } from '../../state/location/location.model';

@Component({
  selector: 'termo-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss']
})
export class MapLocationComponent implements OnInit {
  @Input() location: LocationWithKeyMeasurmentValues;
  @Input() loading: boolean;
  @HostBinding('style.bottom.%') bottom;
  @HostBinding('style.right.%') right;

  constructor(
  ) { }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.right = 100 - (this.location.mapPosition.x * 100);
    this.bottom = 100 - (this.location.mapPosition.y * 100);
  }

}
