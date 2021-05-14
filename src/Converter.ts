import { OpeningHours, OpeningHoursOptions } from "./OpeningHours";

export abstract class Converter<T, U = OpeningHoursOptions> {
    readonly options!: OpeningHoursOptions;
    constructor(readonly openingHours: OpeningHours, options: OpeningHoursOptions = {}) {
        this.options = { ...this.openingHours.options, ...options };
    }

    abstract convert(options?: U): T;
}