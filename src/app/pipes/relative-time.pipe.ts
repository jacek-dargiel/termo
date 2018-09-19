import { Pipe, PipeTransform } from '@angular/core';
import {
  isBefore,
  subDays,
  subHours,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns/esm';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: Date, since = new Date()): any {
    if (isBefore(value, subDays(since, 2))) {
      let days = differenceInCalendarDays(since, value);
      return `${days} dni`;
    }
    if (isBefore(value, subHours(since, 2))) {
      let hours = differenceInHours(since, value);
      return `${hours} godz.`;
    }
    let minutes = differenceInMinutes(since, value);
    return `${minutes} min.`;
  }

}
