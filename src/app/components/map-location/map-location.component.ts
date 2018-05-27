import { Component, Input, HostBinding, ElementRef, HostListener, OnChanges } from '@angular/core';
import { LocationWithKeyMeasurmentValues } from '../../state/location/location.model';
import { MapComponent } from '../../containers/map/map.component';

@Component({
  selector: 'termo-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss']
})
export class MapLocationComponent implements OnChanges {
  @Input() location: LocationWithKeyMeasurmentValues;
  @HostBinding('style.top.px') top;
  @HostBinding('style.left.px') left;

  constructor(
    private map: MapComponent,
    private mapLocation: ElementRef<HTMLElement>,
  ) { }

  ngOnChanges() {
    this.adjustPosition();
  }

  @HostListener('window:resize') onResize() {
    this.adjustPosition();
  }
  adjustPosition() {
    this.left = this.location.mapPosition.x * this.map.el.nativeElement.clientWidth - this.mapLocation.nativeElement.clientWidth;
    this.top = this.location.mapPosition.y * this.map.el.nativeElement.clientHeight - this.mapLocation.nativeElement.clientHeight;
  }

}
