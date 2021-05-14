import { OpeningHours, OpeningHoursOptions } from "./OpeningHours";

export interface Converter<T, U = OpeningHoursOptions> {
    convert(openingHours: OpeningHours, options?: U): T;
}