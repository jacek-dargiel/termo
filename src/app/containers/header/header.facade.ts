import { Injectable } from '@angular/core';
import { RefreshCounterService } from '../../services/refresh-counter.service';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeaderFacade {
  public progress = this.refreshCounter.timer.pipe(
    map(timeLeft => timeLeft * 1000),
    map(timeLeft => (environment.refreshTimeout - timeLeft) / environment.refreshTimeout),
  );

  constructor (
    private refreshCounter: RefreshCounterService,
  ) {}
}
