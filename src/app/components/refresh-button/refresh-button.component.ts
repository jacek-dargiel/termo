import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'termo-refresh-button',
    templateUrl: './refresh-button.component.html',
    styleUrls: ['./refresh-button.component.scss'],
    standalone: false
})
export class RefreshButtonComponent {
  @Input() progress: number;
  @Input() refreshing: boolean;
  @Output() refresh = new EventEmitter<void>();

  onRefreshClick() {
    this.refresh.emit();
  }
}
