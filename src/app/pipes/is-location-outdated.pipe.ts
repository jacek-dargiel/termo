import { Pipe, PipeTransform, Inject } from '@angular/core';
import { subMilliseconds, isBefore } from 'date-fns/esm';
import { environment } from 'environments/environment';
import { TERMO_CURRENT_TIME_FACTORY, timeFactory } from './current-time.injection-token';

@Pipe({
  name: 'isLocationOutdated'
})
export class IsLocationOutdatedPipe implements PipeTransform {
  constructor(@Inject(TERMO_CURRENT_TIME_FACTORY) public currentTimeFactory: timeFactory) {}
  transform(value: any): boolean {
    let thresholdDate = subMilliseconds(this.currentTimeFactory(), environment.locationOutdatedThreshold);
    return isBefore(value, thresholdDate);
  }

}
