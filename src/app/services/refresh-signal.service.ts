import { Injectable } from '@angular/core';
import { interval, ReplaySubject, fromEvent, merge } from 'rxjs';
import { switchMap, map, share, filter, startWith, tap, switchMapTo } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RefreshSignalService {
  private trigger = new ReplaySubject<void>();
  public counter = this.trigger.asObservable().pipe(
    switchMap(() => interval(1000)),
    map(count => (environment.refreshTimeout / 1000) - count),
    filter(timeLeft => timeLeft >= 0),
    share()
  );
  private visibility = merge(
    fromEvent(document, 'visibilitychange'),
    fromEvent(window, 'focus'),
  )
    .pipe(
      startWith(''),
      map(() => !document.hidden)
    );
  public signal = this.counter.pipe(
    filter(value => value === 0),
    switchMapTo(this.visibility),
    tap(visible => console.log({visible})),
    filter(visible => visible === true),
  );

  constructor() { }

  restart() {
    this.trigger.next();
  }
}
