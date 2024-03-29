import { OpeningHoursOptions, OpenTimeInternal } from "../interfaces.ts";
import { createDateTime, insertOpenTime, postOptimize } from "../helpers.ts";
import { Exporter, Importer } from "../Converter.ts";
import { Normalizer } from "../core/Normalizer.ts";

const mapping = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export declare type MicrodataFormat = string | string[];

export class Microdata
  implements
    Importer<MicrodataFormat, OpeningHoursOptions>,
    Exporter<MicrodataFormat, OpeningHoursOptions>
{
  toData(input: OpenTimeInternal[][], options: OpeningHoursOptions) {
    const format: Intl.DateTimeFormatOptions = {
      ...options.dateTimeFormatOptions,
    };
    delete format.timeZone;

    const tmp: { [span: string]: number[] } = {};

    for (const [day, spans] of input.entries()) {
      for (const { from, until } of spans) {
        const span =
          from.toLocaleTimeString("sv", format) +
          "-" +
          until.toLocaleTimeString("sv", format);
        if (!tmp[span]) {
          tmp[span] = [day];
        } else if (!tmp[span].includes(day)) {
          tmp[span].push(day);
        }
      }
    }

    const result = [];
    for (const [span, days] of Object.entries(tmp)) {
      days.sort();

      let prev = -1;
      let tmp = null;
      const weekDays = days
        .reduce<number[][]>((result, day) => {
          if (-1 === prev || day !== prev + 1) {
            tmp = [day];
            result.push(tmp);
          } else {
            tmp.push(day);
          }
          prev = day;
          return result;
        }, [])
        .map((days) =>
          days.length > 1
            ? `${mapping[days[0]]}-${mapping[days[days.length - 1]]}`
            : mapping[days[0]]
        )
        .join(",");

      result.push(`${weekDays} ${span}`);
    }

    return result.length > 1 ? result : result[0] || "";
  }

  fromData(
    input: MicrodataFormat,
    options: OpeningHoursOptions
  ): OpenTimeInternal[][] {
    const times: OpenTimeInternal[][] = [[], [], [], [], [], [], []];
    const currentDate = options.currentDate || new Date();
    const rows = "string" === typeof input ? [input] : input;
    const daysRE = /[a-z]{2}-[a-z]{2}|[a-z]{2}/gi;
    const timeRE = /\d{2}:\d{2}:\d{2}|\d{2}:\d{2}/g;
    const normalizer = new Normalizer(options);
    for (const row of rows) {
      const dayspan = row.match(daysRE) || [];
      const [fromStr, untilStr] = row.match(timeRE) || ["00:00", "23:59"];
      for (const span of dayspan) {
        const [startDayStr, endDayStr] = span.split("-");
        const startDay = mapping.indexOf(startDayStr);
        const endDay = mapping.indexOf(endDayStr);
        for (let i = 0; i < 7; i++) {
          if (
            (startDay === i && endDay === -1) ||
            (endDay > -1 &&
              ((endDay < startDay && (i <= endDay || i >= startDay)) ||
                (i >= startDay && i <= endDay)))
          ) {
            const chunk = normalizer.normalize({
              day: i,
              from: createDateTime(currentDate, i, fromStr),
              until: createDateTime(currentDate, i, untilStr),
            });
            insertOpenTime(chunk, times);
          }
        }
      }
    }
    postOptimize(times);
    return times;
  }
}
