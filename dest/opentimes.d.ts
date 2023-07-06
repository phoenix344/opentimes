export declare enum WeekDays {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}
export declare const WeekDaysShort: string[];
export declare enum OpenState {
    Closed = 0,
    Open = 1
}
export declare type DateType = Date | number | string;
export declare interface DateTimeObject {
    from: DateType;
    until: DateType;
}
export declare interface OpenTimeInternal {
    from: Date;
    until: Date;
    text?: string;
}
export declare interface OpenTimeInput extends DateTimeObject {
    day: WeekDays;
    text?: string;
}
export declare interface OpenTimeRemovableInput extends Partial<DateTimeObject> {
    day?: WeekDays;
    days?: WeekDays[];
    spans?: Partial<DateTimeObject>[];
}
export declare interface OpenTimeOutput {
    day: WeekDays;
    from: string;
    until: string;
    text?: string;
}
export declare interface OpenTimeResultOutput {
    active: boolean;
    day: string;
    times: Array<{
        from: string;
        until: string;
    }>;
}
export declare interface OpeningHoursOptions {
    weekStart: WeekDays;
    currentDate: Date;
    currentDayOnTop: boolean;
    locales: string;
    dateTimeFormatOptions: Intl.DateTimeFormatOptions;
    showClosedDays: boolean;
    text: {
        timespanSeparator: string;
        weekDays: string[];
        closed: string;
        open: string;
    };
}
export interface Importer<Input, Options extends OpeningHoursOptions> {
    fromData(input: Input, options: Options): OpenTimeInternal[][];
}
export interface Exporter<Output, Options extends OpeningHoursOptions> {
    toData(input: OpenTimeInternal[][], options: Options): Output;
}
export declare class OpeningHours {
    static readonly defaultOptions: OpeningHoursOptions;
    readonly options: OpeningHoursOptions;
    currentDate: Date;
    get times(): OpenTimeInternal[][];
    private internalTimes;
    constructor(options?: Partial<OpeningHoursOptions>);
    getState(now?: Date): OpenState;
    /**
     * Check if the subject is opening soon. Default is 30 minutes or
     * 1800 seconds.
     */
    isOpenSoon(now?: Date, elapseSeconds?: number): boolean;
    /**
     * Check if the subject is closing soon. Default is 30 minutes or
     * 1800 seconds.
     */
    isClosedSoon(now?: Date, elapseSeconds?: number): boolean;
    /**
     * Returns the local time string of the next opening time.
     */
    getNextOpenTime(now?: Date): string;
    /**
     * add a single time object and optimize it
     */
    add(day: WeekDays, from: DateType, until: DateType): void;
    /**
     * Cut a timespan out of the opening hours.
     */
    cut(days: WeekDays | WeekDays[], from: DateType, until: DateType): void;
    /**
     * Cut multiple chunks out of the opening hours.
     */
    cutMulti(input: Array<OpenTimeRemovableInput>): void;
    fromJSON(times: OpenTimeInput[], options?: Partial<OpeningHoursOptions>): void;
    /**
     * Creates normalized JSON format.
     */
    toJSON(options?: Partial<OpeningHoursOptions>): OpenTimeInput[];
    fromMicrodata(times: MicrodataFormat, options?: Partial<OpeningHoursOptions>): void;
    /**
     * Creates a string or a string array output of opening hours
     * in microdata format.
     */
    toMicrodata(options?: Partial<OpeningHoursOptions>): string | string[];
    /**
     * Creates an array output for opening hours.
     */
    toLocaleJSON(options?: Partial<OpeningHoursOptions>): OpenTimeResultOutput[];
    /**
     * Creates a string output for opening hours.
     */
    toString(options?: Partial<OpeningHoursOptions>): string;
}
export default function createOpeningHours(options?: OpeningHoursOptions): OpeningHours;
export declare class Json implements Importer<OpenTimeInput[], OpeningHoursOptions>, Exporter<OpenTimeOutput[], OpeningHoursOptions> {
    toData(input: OpenTimeInternal[][], options: OpeningHoursOptions): OpenTimeOutput[];
    fromData(input: OpenTimeInput[], options: OpeningHoursOptions): OpenTimeInternal[][];
}
export declare class DisplayJson implements Exporter<OpenTimeResultOutput[], OpeningHoursOptions> {
    toData(input: OpenTimeInternal[][], options: OpeningHoursOptions): OpenTimeResultOutput[];
    /**
     * defines the leading week day by
     * currentDayOnTop and weekStart options.
     */
    private setLeadingDay;
}
export declare class DisplayText implements Exporter<string, OpeningHoursOptions> {
    toData(input: OpenTimeInternal[][], options: OpeningHoursOptions): string;
}
export declare type MicrodataFormat = string | string[];
export declare class Microdata implements Importer<MicrodataFormat, OpeningHoursOptions>, Exporter<MicrodataFormat, OpeningHoursOptions> {
    toData(input: OpenTimeInternal[][], options: OpeningHoursOptions): string | string[];
    fromData(input: MicrodataFormat, options: OpeningHoursOptions): OpenTimeInternal[][];
}
