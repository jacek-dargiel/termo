import { Component, OnInit, ElementRef } from '@angular/core';
import { MapFacade } from './map.facade';
import { Location } from '../../state/location/location.model';

@Component({
    selector: 'termo-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: false
})
export class MapComponent implements OnInit {
  public loading$ = this.mapFacade.loading$;
  public locations$ = this.mapFacade.locations$;
  public selectedLocation$ = this.mapFacade.selectedLocation$;

  constructor(
    private mapFacade: MapFacade,
    public el: ElementRef<HTMLElement>,
  ) { }

  ngOnInit() {
    this.mapFacade.dispatchMapInit();
    this.mapFacade.getImageDimentions()
      .subscribe(dimentions => this.updateMapRatio(dimentions));
  }

  updateMapRatio({width, height}) {
    let ratio = (height / width).toString();
    this.el.nativeElement.style.setProperty('--mapBackgroundRatio', ratio);
  }

  onLocationSelect(location: Location) {
    this.mapFacade.selectLocation(location).subscribe();
  }

}
