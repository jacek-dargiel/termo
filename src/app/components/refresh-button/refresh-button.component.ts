import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'termo-refresh-button',
    templateUrl: './refresh-button.component.html',
    styleUrls: ['./refresh-button.component.scss'],
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefreshButtonComponent {
  readonly progress = input<number>();
  readonly refreshing = input<boolean>();
  readonly refresh = output();

  onRefreshClick() {
    this.refresh.emit();
  }
}
