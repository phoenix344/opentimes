import { normalizeLocalDate } from "../helpers";
import { Converter } from "../Converter";
import {
  OpenTimeResultOutput,
  OpeningHoursOptions,
  OpenTimeInternal,
} from "../interfaces";
import { WeekDaysShort } from "../WeekDays";

export class DisplayJsonConverter
  implements Converter<OpenTimeResultOutput[], OpeningHoursOptions>
{
  toData(input: OpenTimeInternal[][], options: OpeningHoursOptions) {
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    const { currentDate, locales } = options;
    const weekDays = options.text?.weekDays || WeekDaysShort;

    // make sure the timeZone is set with a value.
    // At least the local time of the current client.
    const { timeZone } = Intl.DateTimeFormat(
      options.locales,
      options.dateTimeFormatOptions
    ).resolvedOptions();
    const current = normalizeLocalDate(currentDate as Date, timeZone);
    const openTimes = [];
    for (const [day, times] of input.entries()) {
      const active = current.getDay() === day;
      if (times.length === 0) {
        // create an object if showClosedDays is enabled.
        openTimes[day] = options.showClosedDays
          ? {
              active,
              day: weekDays[day],
              times: [],
            }
          : null;
      } else {
        // insert opening hours with the correct time format and
        // add the translation of the current day.
        openTimes[day] = {
          active,
          day: weekDays[day],
          times: times.map((time) => {
            const from = time.from.toLocaleTimeString(locales, format);
            const until = time.until.toLocaleTimeString(locales, format);
            return { from, until };
          }),
        };
      }
    }

    // reorder openTimes array to set the currently
    // leading week day at the top.
    this.setLeadingDay(openTimes, options);
    const result = [];

    // discard empty days
    for (const item of openTimes) {
      if (item) {
        result.push(item);
      }
    }
    return result as OpenTimeResultOutput[];
  }

  fromData(
    input: OpenTimeResultOutput[],
    options: OpeningHoursOptions
  ): OpenTimeInternal[][] {
    throw new Error("Not supported!");
  }

  /**
   * defines the leading week day by
   * currentDayOnTop and weekStart options.
   */
  private setLeadingDay<T>(result: T[], options: Partial<OpeningHoursOptions>) {
    const { currentDate, currentDayOnTop, weekStart } = options;
    const weekDay =
      currentDate && currentDayOnTop
        ? currentDate.getDay()
        : weekStart !== undefined
        ? weekStart
        : 0;
    if (weekDay > 0) {
      const previous = result.splice(weekDay);
      result.unshift(...previous);
    }
  }
}
