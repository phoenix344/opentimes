import { OpeningHoursOptions, OpenTimeInternal } from "../interfaces";
import { Converter } from "../Converter";
import { createDateTime } from "../helpers";
import { DisplayJsonConverter } from "./DisplayJsonConverter";

export class DisplayTextConverter
  implements Converter<string, OpeningHoursOptions>
{
  toData(input: OpenTimeInternal[][], options: OpeningHoursOptions) {
    const { timespanSeparator, closed } = options.text || {};
    const result = [];
    const jsonConverter = new DisplayJsonConverter();
    const openTimes = jsonConverter.toData(input, options);
    for (const obj of openTimes) {
      let resultStr: string;
      if (obj.times.length) {
        resultStr = `${obj.day} ${obj.times
          .map((time) => time.from + timespanSeparator + time.until)
          .join(", ")}`;
      } else {
        resultStr = `${obj.day} ${closed}`;
      }
      result.push(obj.active ? "[" + resultStr + "]" : resultStr);
    }
    return result.join("\n");
  }

  fromData(input: string, options: OpeningHoursOptions): OpenTimeInternal[][] {
    throw new Error("Not supported!");
  }
}
