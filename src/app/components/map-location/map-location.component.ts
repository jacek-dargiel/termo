import { Component, Input, HostBinding, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { LocationWithKeyMeasurmentValues, Location } from '../../state/location/location.model';

@Component({
  selector: 'termo-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss']
})
export class MapLocationComponent implements OnInit {
  @Input() location: LocationWithKeyMeasurmentValues;
  @Input() loading: boolean;
  @Input()
  @HostBinding('class.location--selected')
  selected: boolean;
  @Output() select = new EventEmitter<Location>();
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

  @HostListener('click')
  selectLocationEntities() {
    this.select.emit(this.location);
  }

}
