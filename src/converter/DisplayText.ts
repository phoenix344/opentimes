import { OpeningHoursOptions, OpenTimeInternal } from "../interfaces";
import { Exporter } from "../Converter";
import { DisplayJson } from "./DisplayJson";

export class DisplayText
  implements Exporter<string, OpeningHoursOptions>
{
  toData(input: OpenTimeInternal[][], options: OpeningHoursOptions) {
    const { timespanSeparator, closed } = options.text || {};
    const result = [];
    const jsonConverter = new DisplayJson();
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
}
