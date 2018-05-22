import { Component, OnInit } from '@angular/core';
import { MapFacade } from './map.facade';

@Component({
  selector: 'termo-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public locationsLoading$ = this.mapFacade.locationsLoading$;
  public locations$ = this.mapFacade.locations$;

  constructor(
    private mapFacade: MapFacade,
  ) { }

  ngOnInit() {
    this.mapFacade.fetchLocations();
  }

}
