import { MicrodataConverter } from "./converter/MicrodataConverter";
import { DataJsonConverter } from "./converter/DataJsonConverter";
import { DisplayJsonConverter } from "./converter/DisplayJsonConverter";
import { DisplayTextConverter } from "./converter/DisplayTextConverter";
import {
  createDateTime,
  cutTimespans,
  fromRemoteDate,
  getState,
  normalizeUntilTime,
  postOptimize,
} from "./helpers";
import {
  OpeningHoursOptions,
  OpenTimeInternal,
  DateType,
  OpenTimeRemovableInput,
  OpenTimeInput,
} from "./interfaces";
import { WeekDays, WeekDaysShort } from "./WeekDays";

export class OpeningHours {
  static readonly defaultOptions: OpeningHoursOptions = {
    weekStart: WeekDays.Monday,
    currentDate: new Date(),
    currentDayOnTop: false,
    locales: "de-DE",
    dateTimeFormatOptions: {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
    },
    text: {
      closed: "closed",
      open: "open",
      timespanSeparator: " - ",
      weekDays: WeekDaysShort,
    },
    showClosedDays: false,
  };

  readonly options!: OpeningHoursOptions;

  currentDate!: Date;

  // TODO: add some info text to seasonal opening/closing times
  get times(): OpenTimeInternal[][] {
    const currentDate = this.currentDate;
    const weekDay = currentDate.getDay();
    const result = this.internalTimes.default.slice(0);
    const emptyTimes = [[], [], [], [], [], [], []];
    for (const season of this.internalTimes.seasons.values()) {
      for (let i = 0; i < 7; i++) {
        if (weekDay > i) {
          currentDate.setDate(currentDate.getDate() - (weekDay - i));
        } else {
          currentDate.setDate(currentDate.getDate() + i);
        }
        if (currentDate >= season.fromDate && currentDate <= season.untilDate) {
          result[i] = (season.times || emptyTimes)[i].slice(0);
        }
      }
    }
    return result;
  }

  private internalTimes: {
    default: OpenTimeInternal[][];
    seasons: Set<{
      fromDate: Date;
      untilDate: Date;
      text?: string;
      times?: OpenTimeInternal[][];
    }>;
  };

  constructor(options: Partial<OpeningHoursOptions> = {}) {
    // prepare options
    this.options = {
      ...OpeningHours.defaultOptions,
      ...options,
      dateTimeFormatOptions: {
        ...OpeningHours.defaultOptions.dateTimeFormatOptions,
        ...(options.dateTimeFormatOptions || {}),
      },
      text: {
        ...OpeningHours.defaultOptions.text,
        ...(options.text || {}),
      },
    };

    this.currentDate = this.options.currentDate;

    // setup a 2D array for 7 days, started by sunday.
    this.internalTimes = {
      default: [[], [], [], [], [], [], []],
      seasons: new Set(),
    };
  }

  getState(now = new Date()) {
    return getState(this.internalTimes.default, this.options, now);
  }

  /**
   * Check if the subject is opening soon. Default is 30 minutes or
   * 1800 seconds.
   */
  isOpenSoon(now = new Date(), elapseSeconds?: number) {
    // make sure the timeZone is set with a value.
    // At least the local time of the current client.
    const { timeZone } = Intl.DateTimeFormat(
      this.options.locales,
      this.options.dateTimeFormatOptions
    ).resolvedOptions();
    const current = fromRemoteDate(now, timeZone);
    const day = current.getDay();
    const soon = new Date(current);
    soon.setSeconds(soon.getSeconds() + (elapseSeconds || 1800));
    for (const time of this.times[day]) {
      const from = time.from;
      if (from >= current && from <= soon) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the subject is closing soon. Default is 30 minutes or
   * 1800 seconds.
   */
  isClosedSoon(now = new Date(), elapseSeconds?: number) {
    // make sure the timeZone is set with a value.
    // At least the local time of the current client.
    const { timeZone } = Intl.DateTimeFormat(
      this.options.locales,
      this.options.dateTimeFormatOptions
    ).resolvedOptions();
    const current = fromRemoteDate(now, timeZone);
    const day = current.getDay();
    const soon = new Date(current);
    soon.setSeconds(soon.getSeconds() + (elapseSeconds || 1800));
    for (const time of this.times[day]) {
      const from = time.from;
      const until = time.until;
      if (from <= current && until >= current && soon > until) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the local time string of the next opening time.
   */
  getNextOpenTime(now = new Date()) {
    // make sure the timeZone is set with a value.
    // At least the local time of the current client.
    const { timeZone } = Intl.DateTimeFormat(
      this.options.locales,
      this.options.dateTimeFormatOptions
    ).resolvedOptions();
    const { locales } = this.options;
    const format: Intl.DateTimeFormatOptions = {
      ...this.options.dateTimeFormatOptions,
    };
    delete format.timeZone;
    const current = fromRemoteDate(now, timeZone);
    const day = current.getDay();
    for (const time of this.times[day]) {
      const from = time.from;
      const until = time.until;
      if (from <= current && until >= current) {
        return this.options.text.open;
      }
      if (from > current && until > current) {
        return from.toLocaleTimeString(locales, format);
      }
    }
    return this.options.text.closed;
  }

  /**
   * add a single time object and optimize it
   */
  add(day: WeekDays, from: DateType, until: DateType) {
    const time = { day, from, until };
    const optimized = this.optimize(time);
    this.addIfNotExist(optimized);
    postOptimize(this.internalTimes.default);
  }

  /**
   * Cut a timespan out of the opening hours.
   */
  cut(days: WeekDays | WeekDays[], from: DateType, until: DateType) {
    if ("number" === typeof days) {
      days = [days];
    }
    // const timeZone = this.options.dateTimeFormatOptions.timeZone;
    const removables: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    for (const day of days) {
      const time = { day, from, until };

      const optimized = this.optimize(time);
      for (const timespan of optimized) {
        removables[timespan.from.getDay()].push(timespan);
        // timespan.from = toRemoteDate(timespan.from, timeZone);
        // timespan.until = toRemoteDate(timespan.until, timeZone);
      }
    }
    cutTimespans(this.internalTimes.default, removables);
    postOptimize(this.internalTimes.default);
  }

  /**
   * Cut multiple chunks out of the opening hours.
   */
  cutMulti(input: Array<OpenTimeRemovableInput>) {
    // const timeZone = this.options.dateTimeFormatOptions.timeZone;
    const removables: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    for (const removable of input) {
      const days = [];
      const times = [];
      if ("undefined" !== typeof removable.days) {
        days.push(...removable.days);
      } else if ("number" === typeof removable.day) {
        days.push(removable.day);
      }

      if ("undefined" !== typeof removable.spans) {
        for (const span of removable.spans) {
          for (const day of days) {
            times.push({
              day,
              from: span.from || "0000",
              until: span.until || "2359",
            });
          }
        }
      } else {
        for (const day of days) {
          times.push({
            day,
            from: removable.from || "0000",
            until: removable.until || "2359",
          });
        }
      }

      for (const time of times) {
        const optimized = this.optimize(time);
        for (const timespan of optimized) {
          removables[timespan.from.getDay()].push(timespan);
          // timespan.from = toRemoteDate(timespan.from, timeZone);
          // timespan.until = toRemoteDate(timespan.until, timeZone);
        }
      }
    }

    cutTimespans(this.internalTimes.default, removables);
    postOptimize(this.internalTimes.default);
  }

  /**
   * loading a list of time objects and optimize them
   */
  load(times: OpenTimeInput[]) {
    this.internalTimes.default.forEach((times) => times.splice(0));
    for (const time of times) {
      const optimized = this.optimize(time);
      this.addIfNotExist(optimized);
    }
    postOptimize(this.internalTimes.default);
  }

  /**
   * Creates normalized JSON format.
   */
  toJSON(options?: Partial<OpeningHoursOptions>) {
    const converter = new DataJsonConverter();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates an array output for opening hours.
   */
  toLocaleJSON(options?: Partial<OpeningHoursOptions>) {
    const converter = new DisplayJsonConverter();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates a string or a string array output of opening hours
   * in microdata format.
   */
  toMicrodata(options?: Partial<OpeningHoursOptions>) {
    const converter = new MicrodataConverter();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates a string output for opening hours.
   */
  toString(options?: Partial<OpeningHoursOptions>) {
    const converter = new DisplayTextConverter();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates a date object from currentDate and the given
   * opening hours time.
   */
  private getTimeByCurrentDay(date: Date | [number, number, number, number]) {
    if (Array.isArray(date)) {
      const currentDate = this.currentDate;
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
   * add new time entry if it does not exist
   */
  private addIfNotExist(optimizedTimes: OpenTimeInternal[]) {
    for (const time of optimizedTimes) {
      const times = this.internalTimes.default[time.from.getDay()];
      times.push({ ...time });
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
      "Invalid Date" !== date.toString() &&
      "string" === typeof time &&
      time.length >= 16
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

  /**
   * Optimize incoming timespans, convert them to Date format and handle timespans
   * that extend beyond midnight.
   */
  private optimize(
    time: OpenTimeInput,
    removePattern?: RegExp
  ): OpenTimeInternal[] {
    const internal: OpenTimeInternal = {
      from: this.normalizeTimeString(time.from, time.day, removePattern),
      until: this.normalizeTimeString(time.until, time.day, removePattern),
    };
    normalizeUntilTime(internal.until);

    const result = [];
    if (internal.until < internal.from) {
      const untilPrevDay = createDateTime(
        this.currentDate,
        internal.from.getDay(),
        "23:59:00"
      );

      const fromNextDay = createDateTime(
        this.currentDate,
        internal.until.getDay() + 1,
        "00:00:00"
      );

      internal.until.setDate(internal.until.getDate() + 1);
      result.push(
        {
          from: internal.from,
          until: untilPrevDay,
        },
        {
          from: fromNextDay,
          until: internal.until,
        }
      );
    } else {
      result.push(internal);
    }

    return result;
  }
}

export default function createOpeningHours(options?: OpeningHoursOptions) {
  return new OpeningHours(options);
}
