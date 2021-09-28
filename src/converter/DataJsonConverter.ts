import {
  OpenTimeInternal,
  OpeningHoursOptions,
  OpenTimeOutput,
} from "../OpeningHours";
import { Converter } from "../Converter";
import { createDateTime } from "../helpers";

export class DataJsonConverter implements Converter<OpenTimeOutput[]> {
  convert(
    input: OpenTimeInternal[][],
    options: Partial<OpeningHoursOptions> = {}
  ): OpenTimeOutput[] {
    const result: OpenTimeOutput[] = [];
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    for (let i = 0; i < input.length; i++) {
      if (input[i].length === 0) {
        continue;
      }
      for (const { from, until, text } of input[i]) {
        result.push({
          day: i,
          from: from.toLocaleTimeString("sv", format).replace(/:/g, ""),
          until: until.toLocaleTimeString("sv", format).replace(/:/g, ""),
          text,
        });
      }
    }

    return result;
  }

  parse(input: OpenTimeOutput[], options: Partial<OpeningHoursOptions> = {}) {
    const times: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    const currentDate = options.currentDate || new Date();

    for (const { day, from, until, text } of input) {
      times[day].push({
        from: createDateTime(
          currentDate,
          day,
          from.match(/\d{2}/g)?.join(":") || "00:00"
        ),
        until: createDateTime(
          currentDate,
          day,
          until.match(/\d{2}/g)?.join(":") || "00:00"
        ),
        text,
      });
    }
    return times;
  }
}
