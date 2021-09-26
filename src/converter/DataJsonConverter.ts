import {
  OpeningHours,
  OpeningHoursOptions,
  OpenTimeOutput,
} from "../OpeningHours";
import { Converter } from "../Converter";

export class DataJsonConverter implements Converter<OpenTimeOutput[]> {
  convert(openingHours: OpeningHours, options: OpeningHoursOptions = {}) {
    options = { ...openingHours.options, ...options };
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    const result: OpenTimeOutput[] = [];

    for (const [day, times] of openingHours.times.entries()) {
      if (times.length !== 0) {
        // insert opening hours with the correct time format and
        // add the translation of the current day.
        result.push(
          ...times.map((time) => {
            const from = time.from
              .toLocaleTimeString("sv", format)
              .replace(/:/g, "");
            const until = time.until
              .toLocaleTimeString("sv", format)
              .replace(/:/g, "");
            return { day, from, until };
          })
        );
      }
    }
    return result;
  }
}
