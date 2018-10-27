import { Injectable } from '@angular/core';
import { interval, ReplaySubject } from 'rxjs';
import { switchMap, map, share, filter, takeWhile } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RefreshSignalService {
  private trigger = new ReplaySubject<void>();
  public signal = this.trigger.asObservable().pipe(
    switchMap(() => interval(1000)),
    map(count => (environment.refreshTimeout / 1000) - count),
    filter(timeLeft => timeLeft >= 0),
    share()
  );
  public timeouts = this.signal.pipe(
    takeWhile(value => value > 0),
  );

  constructor() { }

  restart() {
    this.trigger.next();
  }
}
