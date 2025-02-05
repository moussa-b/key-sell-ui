export interface SaveCalendarEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  status?: CalendarEventStatus;
  reminder?: number;
  recurring?: boolean;
  recurringOptions?: RepetitionOptions;
  createdBy?: number;
  updatedBy?: number;
}

export enum CalendarEventStatus {
  WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED'
}

export interface RepetitionOptions {
  days: number[];
  repetition: number;
  endDate?: string;
  nbOccurrences?: number;
}
