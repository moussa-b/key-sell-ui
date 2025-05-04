import { LabelValue } from '../models/label-value.model';

export class UtilsService {
  static matchesFilter<T>(value: T, filter: T[]): boolean {
    if (!filter || filter.length === 0) {
      return true;
    }
    return filter.includes(value);
  }

  static matchesLabelValueFilter<T>(items: LabelValue<T>[], filter: T[]): boolean {
    if (!filter || filter.length === 0) {
      return true;
    }
    for (const item of items) {
      if (filter.includes(item.value)) {
        return true;
      }
    }
    return false;
  }

  static formatIsoDateToDisplay(dateISO: string): string {
    const [year, month, day] = dateISO.substring(0, 10).split('-');
    return `${day}.${month}.${year}`;
  }
}
