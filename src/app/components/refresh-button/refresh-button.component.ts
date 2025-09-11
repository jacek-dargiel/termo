import { Component, input, output } from '@angular/core';

@Component({
    selector: 'termo-refresh-button',
    templateUrl: './refresh-button.component.html',
    styleUrls: ['./refresh-button.component.scss'],
    standalone: false
})
export class RefreshButtonComponent {
  readonly progress = input<number>();
  readonly refreshing = input<boolean>();
  readonly refresh = output();

  onRefreshClick() {
    this.refresh.emit();
  }
}
