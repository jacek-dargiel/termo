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

  transform(value: Date): any {
    const now = new Date();
    if (isBefore(value, subDays(now, 2))) {
      const days = differenceInCalendarDays(now, value);
      return `${days} dni`;
    }
    if (isBefore(value, subHours(now, 2))) {
      const hours = differenceInHours(now, value);
      return `${hours} godz.`;
    }
    const minutes = differenceInMinutes(now, value);
    return `${minutes} min.`;
  }

}
