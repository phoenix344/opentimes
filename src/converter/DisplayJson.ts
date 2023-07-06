import { fromRemoteDate } from "../helpers.ts";
import { Exporter } from "../Converter.ts";
import {
  OpenTimeResultOutput,
  OpeningHoursOptions,
  OpenTimeInternal,
} from "../interfaces.ts";
import { WeekDaysShort } from "../WeekDays.ts";

export class DisplayJson
  implements Exporter<OpenTimeResultOutput[], OpeningHoursOptions>
{
  toData(input: OpenTimeInternal[][], options: OpeningHoursOptions) {
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    const timeZone = options.dateTimeFormatOptions.timeZone;
    delete format.timeZone;

    const { currentDate, locales } = options;
    const weekDays = options.text?.weekDays || WeekDaysShort;
    const openTimes = [];
    for (const [day, times] of input.entries()) {
      const active = fromRemoteDate(currentDate, timeZone).getDay() === day;
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
            const fromDate = time.from;
            const untilDate = time.until;

            if (untilDate.getHours() === 0 && untilDate.getMinutes() === 0) {
              untilDate.setHours(23);
              untilDate.setMinutes(59);
              untilDate.setSeconds(0);
              untilDate.setMilliseconds(0);
            }

            const from = fromDate.toLocaleTimeString(locales, format);
            const until = untilDate.toLocaleTimeString(locales, format);

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

  /**
   * defines the leading week day by
   * currentDayOnTop and weekStart options.
   */
  private setLeadingDay<T>(result: T[], options: Partial<OpeningHoursOptions>) {
    const { currentDate, currentDayOnTop, weekStart } = options;
    const timeZone = options.dateTimeFormatOptions?.timeZone;
    const weekDay =
      currentDate && currentDayOnTop
        ? fromRemoteDate(currentDate, timeZone).getDay()
        : weekStart !== undefined
        ? weekStart
        : 0;
    if (weekDay > 0) {
      const previous = result.splice(weekDay);
      result.unshift(...previous);
    }
  }
}
