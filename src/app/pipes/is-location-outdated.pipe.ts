import { Pipe, PipeTransform } from '@angular/core';
import { subMilliseconds, isBefore } from 'date-fns/esm';
import { environment } from 'environments/environment';

@Pipe({
  name: 'isLocationOutdated'
})
export class IsLocationOutdatedPipe implements PipeTransform {

  transform(value: any, since = new Date()): boolean {
    let thresholdDate = subMilliseconds(since, environment.locationOutdatedThreshold);
    return isBefore(value, thresholdDate);
  }

}
