import { OpeningHours, OpenTimeOutput } from "../OpeningHours";
import { Converter } from "../Converter";
import { convertToSimpleFormat } from "../helpers";

export class DataJsonConverter implements Converter<OpenTimeOutput[]> {
    convert(openingHours: OpeningHours) {
        const result: OpenTimeOutput[] = [];
        for (const [day, spans] of openingHours.times.entries()) {
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