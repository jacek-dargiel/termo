import { Pipe, PipeTransform } from '@angular/core';
import { subMilliseconds, isBefore } from 'date-fns/esm';
import { environment } from 'environments/environment';

@Pipe({
  name: 'isLocationOutdated'
})
export class IsLocationOutdatedPipe implements PipeTransform {

  transform(value: any): any {
    const thresholdDate = subMilliseconds(new Date(), environment.locationOutdatedThreshold);
    return isBefore(value, thresholdDate);
  }

}
