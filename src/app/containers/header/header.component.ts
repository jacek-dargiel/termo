import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderFacade } from './header.facade';
import { RefreshButtonComponent } from '../../components/refresh-button/refresh-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'termo-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [RefreshButtonComponent, AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private headerFacade = inject(HeaderFacade);

  public progress$ = this.headerFacade.progress;
  public refreshing$ = this.headerFacade.refreshing;

  public refresh () {
    this.headerFacade.refresh();
  }

}
