import { Component } from '@angular/core';
import { HeaderFacade } from './header.facade';

@Component({
    selector: 'termo-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {
  public progress$ = this.headerFacade.progress;
  public refreshing$ = this.headerFacade.refreshing;

  constructor(
    private headerFacade: HeaderFacade,
  ) { }

  public refresh () {
    this.headerFacade.refresh();
  }

}
