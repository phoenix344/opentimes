import {
  OpenTimeInput,
  OpenTimeOutput,
  OpeningHoursOptions,
  OpenTimeInternal,
} from "../interfaces.ts";
import { Exporter, Importer } from "../Converter.ts";
import { Normalizer } from "../core/Normalizer.ts";
import { insertOpenTime, postOptimize } from "../helpers.ts";

export class Json
  implements
    Importer<OpenTimeInput[], OpeningHoursOptions>,
    Exporter<OpenTimeOutput[], OpeningHoursOptions>
{
  toData(
    input: OpenTimeInternal[][],
    options: OpeningHoursOptions
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

  fromData(input: OpenTimeInput[], options: OpeningHoursOptions) {
    const times: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    const normalizer = new Normalizer(options);

    for (const data of input) {
      const chunk = normalizer.normalize(data);
      insertOpenTime(chunk, times);
    }
    postOptimize(times);
    return times;
  }
}
