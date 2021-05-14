import { OpeningHoursOptions } from "OpeningHours";
import { Converter } from "../Converter";

export class Microdata extends Converter<string | string[]> {
    convert(options: OpeningHoursOptions = {}) {
        options = { ...this.options, ...options };
        const mapping = ['Su', 'Mo', 'Tu', 'Th', 'We', 'Fr', 'Sa'];

        const format: Intl.DateTimeFormatOptions = { ...options.dateTimeFormatOptions };
        const { locales } = options;

        const tmp: { [span: string]: number[] } = {};
        for (const [day, spans] of this.openingHours.times.entries()) {
            for (const { from, until } of spans) {
                const span = from.toLocaleTimeString(locales, format) + '-' + until.toLocaleTimeString(locales, format);
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
            const weekDays = days.reduce<number[][]>((result, day) => {
                if (-1 === prev || day !== prev + 1) {
                    tmp = [day];
                    result.push(tmp);
                } else {
                    tmp.push(day);
                }
                prev = day;
                return result;
            }, [])
                .map((days) => days.length > 1 ? `${mapping[days[0]]}-${mapping[days[days.length - 1]]}` : mapping[days[0]])
                .join(',');

            result.push(`${weekDays} ${span}`);
        }

        return result.length > 1 ? result : result[0] || '';
    }
}