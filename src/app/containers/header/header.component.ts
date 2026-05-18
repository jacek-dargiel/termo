import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LocationFacade } from '../../services/location.facade';
import { RefreshButtonComponent } from '../../components/refresh-button/refresh-button.component';

@Component({
    selector: 'termo-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [RefreshButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  protected readonly facade = inject(LocationFacade);

  public refresh () {
    this.facade.manualRefresh();
  }

}
