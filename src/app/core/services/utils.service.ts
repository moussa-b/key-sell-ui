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

  static formatDateToDatabase(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static createDateTime(dateStr: string, timeStr: string): Date {
    const normalizedDateStr = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
    const isoString = `${normalizedDateStr}T${timeStr}`;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date or time format');
    }
    return date;
  }

  static addHoursToDate(date: Date, minutesToAdd: number): Date {
    return new Date(date.getTime() + minutesToAdd * 60 * 60000);
  }
}
