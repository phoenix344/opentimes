import { OpeningHoursOptions, OpenTimeInternal } from "./OpeningHours";

export interface Converter<T, U = OpeningHoursOptions> {
  convert(input: OpenTimeInternal[][], options?: Partial<U>): T;
  parse(input: T, options?: Partial<U>): OpenTimeInternal[][];
}
