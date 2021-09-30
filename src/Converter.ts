import { OpeningHoursOptions, OpenTimeInternal } from "./interfaces";

export interface Converter<T, U extends OpeningHoursOptions> {
  toData(input: OpenTimeInternal[][], options: U): T;
  fromData(input: T, options: U): OpenTimeInternal[][];
}
