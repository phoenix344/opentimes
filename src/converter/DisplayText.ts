import { OpeningHoursOptions } from "../OpeningHours";
import { Converter } from "../Converter";
import { DisplayJson } from "./DisplayJson";

export class DisplayText extends Converter<string> {
    render(options: OpeningHoursOptions = {}) {
        const {
            timespanSeparator,
            closed
        } = { ...this.openingHours.text,  ...(options.text || {}) };
        const result = [];
        const jsonRenderer = new DisplayJson(this.openingHours, this.options);
        const openTimes = jsonRenderer.render(options);
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