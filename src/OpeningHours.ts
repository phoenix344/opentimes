import { Microdata, MicrodataFormat } from "./converter/Microdata";
import { Json } from "./converter/Json";
import { DisplayJson } from "./converter/DisplayJson";
import { DisplayText } from "./converter/DisplayText";
import {
  cutTimespans,
  fromRemoteDate,
  getState,
  insertOpenTime,
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
import { Normalizer } from "./core/Normalizer";

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
    const normalizer = new Normalizer(this.options);
    const time = { day, from, until };
    const optimized = normalizer.normalize(time);
    insertOpenTime(optimized, this.internalTimes.default);
    postOptimize(this.internalTimes.default);
  }

  /**
   * Cut a timespan out of the opening hours.
   */
  cut(days: WeekDays | WeekDays[], from: DateType, until: DateType) {
    if ("number" === typeof days) {
      days = [days];
    }
    const normalizer = new Normalizer(this.options);
    const removables: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    for (const day of days) {
      const time = { day, from, until };

      const optimized = normalizer.normalize(time);
      insertOpenTime(optimized, removables);
    }
    cutTimespans(this.internalTimes.default, removables);
    postOptimize(this.internalTimes.default);
  }

  /**
   * Cut multiple chunks out of the opening hours.
   */
  cutMulti(input: Array<OpenTimeRemovableInput>) {
    const normalizer = new Normalizer(this.options);
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
        const optimized = normalizer.normalize(time);
        insertOpenTime(optimized, removables);
      }
    }

    cutTimespans(this.internalTimes.default, removables);
    postOptimize(this.internalTimes.default);
  }

  /**
   * loading a list of time objects and optimize them
   */
  load(times: OpenTimeInput[]) {
    const normalizer = new Normalizer(this.options);
    this.internalTimes.default.forEach((times) => times.splice(0));
    for (const time of times) {
      const optimized = normalizer.normalize(time);
      insertOpenTime(optimized, this.internalTimes.default);
    }
    postOptimize(this.internalTimes.default);
  }

  fromJSON(times: OpenTimeInput[], options: Partial<OpeningHoursOptions> = {}) {
    const converter = new Json();
    this.internalTimes.default.splice(0);

    const internalTimes = converter.fromData(times, {
      ...this.options,
      ...options,
    });

    this.internalTimes.default.push(...internalTimes);
  }

  /**
   * Creates normalized JSON format.
   */
  toJSON(options?: Partial<OpeningHoursOptions>) {
    const converter = new Json();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  fromMicrodata(
    times: MicrodataFormat,
    options: Partial<OpeningHoursOptions> = {}
  ) {
    const converter = new Microdata();
    this.internalTimes.default.splice(0);

    const internalTimes = converter.fromData(times, {
      ...this.options,
      ...options,
    });

    this.internalTimes.default.push(...internalTimes);
  }

  /**
   * Creates a string or a string array output of opening hours
   * in microdata format.
   */
  toMicrodata(options?: Partial<OpeningHoursOptions>) {
    const converter = new Microdata();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates an array output for opening hours.
   */
  toLocaleJSON(options?: Partial<OpeningHoursOptions>) {
    const converter = new DisplayJson();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }

  /**
   * Creates a string output for opening hours.
   */
  toString(options?: Partial<OpeningHoursOptions>) {
    const converter = new DisplayText();
    return converter.toData(this.times, {
      ...this.options,
      ...(options || {}),
    });
  }
}

export default function createOpeningHours(options?: OpeningHoursOptions) {
  return new OpeningHours(options);
}
