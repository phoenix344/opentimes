import { OpenTimeOutput } from "../OpeningHours";
import { Converter } from "../Converter";
import { convertToSimpleFormat } from "../helpers";

export class DataJson extends Converter<OpenTimeOutput[]> {
    convert() {
        const result: OpenTimeOutput[] = [];
        for (const [day, spans] of this.openingHours.times.entries()) {
            if (spans.length === 0) {
                continue;
            }
            result.push(...spans
                .map(time => {
                    const from = convertToSimpleFormat(time.from);
                    const until = convertToSimpleFormat(time.until);
                    return { day, from, until };
                }));
        }
        return result;
    }
}