import { Component, OnInit, Input, HostBinding, ElementRef, HostListener } from '@angular/core';
import { Location } from '../../state/location/location.model';
import { MapComponent } from '../../containers/map/map.component';

@Component({
  selector: 'termo-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss']
})
export class MapLocationComponent implements OnInit {
  @Input() location: Location;
  @HostBinding('style.top.px') top;
  @HostBinding('style.left.px') left;

  constructor(
    private map: MapComponent,
    private mapLocation: ElementRef<HTMLElement>,
  ) { }

  ngOnInit() {
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
