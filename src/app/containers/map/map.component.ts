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
  private readonly locationFacade = inject(LocationFacade);
  private readonly mapBackground = inject(MapBackgroundService);
  el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly enrichedLocations = this.locationFacade.enrichedLocations;
  readonly isLoading = this.locationFacade.isLoading;
  readonly selectedLocation = this.locationFacade.selectedLocation;

  ngOnInit() {
    this.locationFacade.init();
    this.mapBackground.getImageDimentions(environment.mapBackgroundUrl)
      .subscribe(dimentions => this.updateMapRatio(dimentions));
  }

  updateMapRatio({width, height}: {width: number, height: number}) {
    const ratio = (height / width).toString();
    this.el.nativeElement.style.setProperty('--mapBackgroundRatio', ratio);
  }

  onLocationSelect(location: Location) {
    this.locationFacade.selectLocation(location);
  }

}
