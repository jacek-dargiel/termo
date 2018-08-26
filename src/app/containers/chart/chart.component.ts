import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { ChartFacade } from './chart.facade';
import { Subscription } from 'rxjs';
import { Location } from '../../state/location/location.model';

@Component({
  selector: 'termo-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {
  @HostBinding('class.chart--visible') visible = false;
  selectedLocationSub: Subscription;
  location: Location;

  constructor(
    private chartFacade: ChartFacade,
  ) { }

  ngOnInit() {
    this.selectedLocationSub = this.chartFacade.selectedLocation$
      .subscribe(location => this.changeSelectedLocation(location));
  }

  ngOnDestroy() {
    if (this.selectedLocationSub) {
      this.selectedLocationSub.unsubscribe();
    }
  }

  changeSelectedLocation(location: Location) {
    this.visible = Boolean(location);
    this.location = location;
  }

  close() {
    this.chartFacade.closeChart();
  }

}
