import {
  OpenTimeOutput,
  OpeningHoursOptions,
  OpenTimeInternal,
} from "./OpeningHours";

export interface Converter<T, U = OpeningHoursOptions> {
  convert(input: OpenTimeInternal[], options?: U): T;
  parse(input: T, options?: U): OpenTimeOutput[];
}
