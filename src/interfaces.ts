import { WeekDays } from "./WeekDays";

export declare type DateType = Date | number | string;

export declare interface DateTimeObject {
  from: DateType;
  until: DateType;
}

export declare interface OpenTimeInternal {
  from: Date;
  until: Date;
  text?: string;
}

export declare interface OpenTimeInput extends DateTimeObject {
  day: WeekDays;
}

export declare interface OpenTimeRemovableInput {
  day?: WeekDays;
  days?: WeekDays[];
  from?: DateType;
  until?: DateType;
  spans?: Partial<DateTimeObject>[];
}

export declare interface OpenTimeOutput {
  day: WeekDays;
  from: string;
  until: string;
  text?: string;
}

export declare interface OpenTimeResultOutput {
  active: boolean;
  day: string;
  times: Array<{
    from: string;
    until: string;
  }>;
}

export declare interface OpeningHoursOptions {
  weekStart: WeekDays;
  currentDate: Date;
  currentDayOnTop: boolean;
  locales: string;
  dateTimeFormatOptions: Intl.DateTimeFormatOptions;
  showClosedDays: boolean;
  text: {
    timespanSeparator: string;
    weekDays: string[];
    closed: string;
  };
}
