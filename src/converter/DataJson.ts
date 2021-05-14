import { OpenTimeOutput } from "../OpeningHours";
import { Converter } from "../Converter";

export class DataJson extends Converter<OpenTimeOutput[]> {
    render() {
        const result: OpenTimeOutput[] = [];
        for (const [day, times] of this.openingHours.times.entries()) {
            if (times.length === 0) {
                continue;
            }
            result.push(...times
                .map(time => {
                    const from = this.convertToSimpleFormat(time.from);
                    const until = this.convertToSimpleFormat(time.until);
                    return { day, from, until };
                }));
        }
        return result;
    }

    /**
     * Create a simplified 24h time format without any separator.
     */
     private convertToSimpleFormat(date: Date) {
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return ('00' + hours).slice(hours.length) +
            ('00' + minutes).slice(minutes.length) +
            (seconds !== '0' ?
                ('00' + seconds).slice(seconds.length) : '');
    }
}