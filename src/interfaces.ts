import { WeekDays } from "./WeekDays.ts";

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
  text?: string;
}

export declare interface OpenTimeRemovableInput
  extends Partial<DateTimeObject> {
  day?: WeekDays;
  days?: WeekDays[];
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
    open: string;
  };
}
