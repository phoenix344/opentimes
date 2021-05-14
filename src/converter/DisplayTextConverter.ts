import { OpeningHours, OpeningHoursOptions } from "../OpeningHours";
import { Converter } from "../Converter";
import { DisplayJsonConverter } from "./DisplayJsonConverter";

export class DisplayTextConverter implements Converter<string> {
    convert(openingHours: OpeningHours, options: OpeningHoursOptions = {}) {
        const {
            timespanSeparator,
            closed
        } = { ...openingHours.text,  ...(options.text || {}) };
        const result = [];
        const jsonRenderer = new DisplayJsonConverter();
        const openTimes = jsonRenderer.convert(openingHours, options);
        for (const obj of openTimes) {
            let resultStr: string;
            if (obj.times.length) {
                resultStr = `${obj.day} ${obj.times.map(time => (
                    time.from +
                    timespanSeparator +
                    time.until
                )).join(', ')}`;
            } else {
                resultStr = `${obj.day} ${closed}`;
            }
            result.push(obj.active ? '[' + resultStr + ']' : resultStr);
        }
        return result.join('\n');
    }
}