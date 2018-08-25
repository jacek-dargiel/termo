import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { MDCSnackbarData } from '@material/snackbar/foundation';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public messages = new Subject<MDCSnackbarData>();
  // public messages = this._messages.asObservable();
  constructor() { }

  show(dataObject: MDCSnackbarData) {
    this.messages.next(dataObject);
  }
}
