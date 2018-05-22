import { Component, OnInit } from '@angular/core';
import { MapFacade } from './map.facade';

@Component({
  selector: 'termo-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor(
    private mapFacade: MapFacade,
  ) { }

  ngOnInit() {
    this.mapFacade.fetchLocations();
  }

}
