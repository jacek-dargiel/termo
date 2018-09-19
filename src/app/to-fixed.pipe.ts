import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {

  transform(value: number, precision = 2): any {
    try {
      return value.toFixed(precision);
    } catch (e) {
      return '';
    }
  }

}
