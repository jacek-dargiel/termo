import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ErrorHandlingService {
  private errorsSubject = new Subject<Error>();
  public errors$ = this.errorsSubject.asObservable();

  handle(error: Error) {
    this.errorsSubject.next(error);
  }
}
