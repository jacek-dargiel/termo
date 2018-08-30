import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MDCSnackbar } from '@material/snackbar';
import { MDCSnackbarData } from '@material/snackbar/foundation';

import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'termo-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements AfterViewInit, OnDestroy {
  snackbar: MDCSnackbar;
  messagesSub = this.snackbarService.messages
    .subscribe((dataObject: MDCSnackbarData) => this.showSnackbar(dataObject));
  @ViewChild('snackbarRef') el: ElementRef<HTMLElement>;

  constructor(
    private snackbarService: SnackbarService,
  ) { }

  ngAfterViewInit() {
    this.snackbar = new MDCSnackbar(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.messagesSub.unsubscribe();
  }

  showSnackbar(dataObject: MDCSnackbarData) {
    if (!this.snackbar) {
      console.error('Can\'t show snackbar before view init.', dataObject);
      return;
    }
    this.snackbar.show(dataObject);
  }

}
