import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPen',
  standalone: true
})
export class CurrencyPenPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'S/ 0.00';
    }
    return this.formatter.format(Number(value));
  }
}
