import { Component, Output, EventEmitter, input } from '@angular/core';

@Component({
    selector: 'termo-refresh-button',
    templateUrl: './refresh-button.component.html',
    styleUrls: ['./refresh-button.component.scss'],
    standalone: false
})
export class RefreshButtonComponent {
  readonly progress = input<number>();
  readonly refreshing = input<boolean>();
  @Output() refresh = new EventEmitter<void>();

  onRefreshClick() {
    this.refresh.emit();
  }
}
