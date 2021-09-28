import {
  OpenTimeInternal,
  OpeningHoursOptions,
  OpenTimeOutput,
} from "../OpeningHours";
import { Converter } from "../Converter";

export class DataJsonConverter implements Converter<OpenTimeOutput[]> {
  convert(
    input: OpenTimeInternal[][],
    options: OpeningHoursOptions = {}
  ): OpenTimeOutput[] {
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    const result: OpenTimeOutput[] = [];

    for (let i = 0; i < input.length; i++) {
      if (input[i].length === 0) {
        continue;
      }
      for (const { from, until, text } of input[i]) {
        result.push({
          day: from.getDay(),
          from: from.toLocaleTimeString("sv", format).replace(/:/g, ""),
          until: until.toLocaleTimeString("sv", format).replace(/:/g, ""),
          text,
        });
      }
    }

    return result;
  }

  parse(input: OpenTimeOutput[]): OpenTimeOutput[] {
    return input;
  }
}
