import { WeekDays } from "../WeekDays";
import { normalizeUntilTime, createDateTime, fromRemoteDate } from "../helpers";
import {
  OpeningHoursOptions,
  OpenTimeInput,
  OpenTimeInternal,
} from "../interfaces";

export class Normalizer {
  constructor(private options: OpeningHoursOptions) {}

  normalize(time: OpenTimeInput, removePattern?: RegExp): OpenTimeInternal[] {
    const internal: OpenTimeInternal = {
      from: this.normalizeTimeString(time.from, time.day, removePattern),
      until: this.normalizeTimeString(time.until, time.day, removePattern),
    };
    normalizeUntilTime(internal.until);

    const result = [];
    if (internal.until < internal.from) {
      const untilPrevDay = createDateTime(
        this.options.currentDate,
        internal.from.getDay(),
        "23:59:00"
      );

      const nextDayFrom = createDateTime(
        this.options.currentDate,
        internal.until.getDay() + 1,
        "00:00:00"
      );

      const nextDayUntil = createDateTime(
        this.options.currentDate,
        internal.until.getDay() + 1,
        internal.until.toLocaleTimeString("sv")
      );

      internal.until.setDate(internal.until.getDate() + 1);
      result.push(
        {
          from: internal.from,
          until: untilPrevDay,
        },
        {
          from: nextDayFrom,
          until: nextDayUntil,
        }
      );
    } else {
      result.push(internal);
    }

    return result;
  }

  /**
   * Creates a date object from currentDate and the given
   * opening hours time.
   */
  private getTimeByCurrentDay(date: Date | [number, number, number, number]) {
    if (Array.isArray(date)) {
      const currentDate = this.options.currentDate;
      const timeZone = this.options.dateTimeFormatOptions.timeZone;
      const [day, hours, minutes, seconds] = date;

      const current = fromRemoteDate(currentDate, timeZone);
      const dayOffset = day - current.getDay();
      current.setDate(current.getDate() + dayOffset);
      current.setHours(hours);
      current.setMinutes(minutes);
      current.setSeconds(seconds);

      return current;
    } else {
      return date;
    }
  }

  /**
   * this method is the magical unicorn that gets all the funky shit done!
   * - Interpreting Date, Unix Timestamp, ISO 8601 DateTime => CHECK
   * - Interpreting fuzzy 24h time strings => CHECK
   */
  private normalizeTimeString(
    time: Date | number | string,
    day: WeekDays,
    pattern = /\d{1,2}/g
  ) {
    const date = new Date(time);
    if (
      time instanceof Date ||
      ("Invalid Date" !== date.toString() &&
        "string" === typeof time &&
        time.length >= 16)
    ) {
      return this.getTimeByCurrentDay(date);
    } else if ("string" === typeof time) {
      const matched = time.match(pattern);
      if (matched) {
        let [hours, minutes, seconds] = matched
          .slice(0, 3)
          .map((n) => parseInt(n));

        // make sure second has a valid value.
        if ("undefined" === typeof seconds) {
          seconds = 0;
        }

        // I'm zeroing the values 24:00 and 23:59,
        // because I need a solid foundation to
        // normalize for after midnight

        if (hours === 24 && minutes === 0) {
          hours = 0;
        }
        if (hours === 23 && minutes === 59) {
          hours = 0;
          minutes = 0;
        }
        const date = this.getTimeByCurrentDay([day, hours, minutes, seconds]);
        if (date.getDay() !== day) {
          date.setDate(date.getDate() - 1);
        }
        return date;
      }
    }
    throw new Error(`Invalid time string: ${time}`);
  }
}
