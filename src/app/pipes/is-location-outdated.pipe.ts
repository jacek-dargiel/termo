import { Pipe, PipeTransform, inject } from '@angular/core';
import { subMilliseconds, isBefore } from 'date-fns';
import { environment } from 'environments/environment';
import { TERMO_CURRENT_TIME_FACTORY, timeFactory } from './current-time.injection-token';

@Pipe({ name: 'isLocationOutdated' })
export class IsLocationOutdatedPipe implements PipeTransform {
  currentTimeFactory = inject<timeFactory>(TERMO_CURRENT_TIME_FACTORY);

  transform(value: Date): boolean {
    let thresholdDate = subMilliseconds(this.currentTimeFactory(), environment.locationOutdatedThreshold);
    return isBefore(value, thresholdDate);
  }

}
