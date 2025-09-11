import { Pipe, PipeTransform, inject } from '@angular/core';
import {
  isBefore,
  subDays,
  subHours,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { TERMO_CURRENT_TIME_FACTORY, timeFactory } from './current-time.injection-token';

@Pipe({
    name: 'relativeTime',
    pure: false
})
export class RelativeTimePipe implements PipeTransform {
  currentTimeFactory = inject<timeFactory>(TERMO_CURRENT_TIME_FACTORY);


  transform(value: Date): any {
    let since = this.currentTimeFactory();
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
