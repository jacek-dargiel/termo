import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {

  transform(value: number, precision = 2, locale?: string): any {
    let fixed;
    if (typeof value !== 'number') {
      return '–';
    }
    try {
      let formatingOptions: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      };
      let formater = Intl.NumberFormat(locale, formatingOptions);
      fixed = formater.format(value);
      return fixed;
    } catch (e) {
      fixed = value.toFixed(precision);
      fixed = fixed.replace('.', ',');
      return fixed;
    }
  }
}
