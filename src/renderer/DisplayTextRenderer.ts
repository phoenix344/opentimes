import { OpeningHoursOptions } from "../OpeningHours";
import { Renderer } from "../Renderer";
import { DisplayJsonRenderer } from "./DisplayJsonRenderer";

export class DisplayTextRenderer extends Renderer<string> {
    render(options: OpeningHoursOptions = {}) {
        const {
            timespanSeparator,
            closed
        } = { ...this.openingHours.text,  ...(options.text || {}) };
        const result = [];
        const jsonRenderer = new DisplayJsonRenderer(this.openingHours, this.options);
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