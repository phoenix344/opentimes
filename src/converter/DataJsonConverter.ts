import {
  OpeningHours,
  OpeningHoursOptions,
  OpenTimeOutput,
} from "../OpeningHours";
import { Converter } from "../Converter";
import { DisplayJsonConverter } from "./DisplayJsonConverter";

export class DataJsonConverter implements Converter<OpenTimeOutput[]> {
  convert(openingHours: OpeningHours, options: OpeningHoursOptions = {}) {
    const result: OpenTimeOutput[] = [];
    const format: Intl.DateTimeFormatOptions = {
      ...openingHours.options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    const { weekDays } = { ...openingHours.text, ...(options.text || {}) };
    const jsonConverter = new DisplayJsonConverter();
    const openTimes = jsonConverter.convert(openingHours, options);

    for (const times of openTimes) {
      for (const time of times.times) {
        result.push({
          day: weekDays.indexOf(times.day),
          from: time.from.replace(/:/g, ""),
          until: time.until.replace(/:/g, ""),
        });
      }
    }
    return result;
  }
}
