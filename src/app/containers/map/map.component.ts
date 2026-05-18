import { Component, OnInit, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { LocationFacade } from '../../services/location.facade';
import { Location } from '../../interfaces';
import { HeaderComponent } from '../header/header.component';
import { MapLocationComponent } from '../../components/map-location/map-location.component';
import { MapBackgroundService } from '../../services/map-background.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'termo-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [HeaderComponent, MapLocationComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  readonly facade = inject(LocationFacade);
  private readonly mapBackground = inject(MapBackgroundService);
  el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit() {
    this.facade.init();
    this.mapBackground.getImageDimentions(environment.mapBackgroundUrl)
      .subscribe(dimentions => this.updateMapRatio(dimentions));
  }

  updateMapRatio({width, height}) {
    let ratio = (height / width).toString();
    this.el.nativeElement.style.setProperty('--mapBackgroundRatio', ratio);
  }

  onLocationSelect(location: Location) {
    this.facade.selectLocation(location);
  }

}
