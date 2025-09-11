import { Component, inject } from '@angular/core';
import { HeaderFacade } from './header.facade';

@Component({
    selector: 'termo-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {
  private headerFacade = inject(HeaderFacade);

  public progress$ = this.headerFacade.progress;
  public refreshing$ = this.headerFacade.refreshing;

  public refresh () {
    this.headerFacade.refresh();
  }

}
