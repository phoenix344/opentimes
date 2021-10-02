import { OpeningHoursOptions, OpenTimeInternal } from "./interfaces";

export interface Importer<Input, Options extends OpeningHoursOptions> {
  fromData(input: Input, options: Options): OpenTimeInternal[][];
}

export interface Exporter<Output, Options extends OpeningHoursOptions> {
  toData(input: OpenTimeInternal[][], options: Options): Output;
}
