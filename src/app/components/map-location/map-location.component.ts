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
  @HostBinding('style.top.%') top;
  @HostBinding('style.left.%') left;

  constructor(
  ) { }

  ngOnInit() {
    this.adjustPosition();
  }

  adjustPosition() {
    this.left = this.location.mapPosition.x * 100;
    this.top = this.location.mapPosition.y * 100;
  }

}
