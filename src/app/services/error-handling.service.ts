import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ErrorHandlingService {
  private _error$ = new Subject<Error>();
  public error$ = this._error$.asObservable();

  handle(error: Error) {
    this._error$.next(error);
  }
}
