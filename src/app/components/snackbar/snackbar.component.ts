import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { MDCSnackbar } from '@material/snackbar';

import { SnackbarData, SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'termo-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss'],
    standalone: false
})
export class SnackbarComponent implements AfterViewInit, OnDestroy {
  private snackbarService = inject(SnackbarService);

  snackbar: MDCSnackbar;
  messagesSub = this.snackbarService.messages
    .subscribe((dataObject) => this.showSnackbar(dataObject));
  @ViewChild('snackbarRef', { static: true }) el: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    this.snackbar = new MDCSnackbar(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.messagesSub.unsubscribe();
  }

  showSnackbar(dataObject: SnackbarData) {
    if (!this.snackbar) {
      console.error('Can\'t show snackbar before view init.', dataObject);
      return;
    }
    this.snackbar.labelText = dataObject.message;
    this.snackbar.timeoutMs = dataObject.timeout;
    this.snackbar.open();
  }

}
