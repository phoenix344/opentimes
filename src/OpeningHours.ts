
export declare type DateType = Date | number | string;

export declare interface DateTimeObject {
    from: DateType;
    until: DateType;
}

export declare interface OpenTimeInternal {
    from: Date;
    until: Date;
}

export declare interface OpenTimeInput extends DateTimeObject {
    day: WeekDays;
}

export declare interface OpenTimeOutput {
    day: WeekDays;
    from: string;
    until: string;
}

export declare interface OpenTimeResultOutput {
    active: boolean;
    day: WeekDays;
    times: OpenTimeOutput[];
}

export declare interface OpeningHoursOptions {
    fromUntilSeparator?: string;
    weekStart?: WeekDays;
    weekDays?: string[];
    currentDate?: Date;
    currentDayOnTop?: boolean;
    locales?: string;
    formatOptions?: Intl.DateTimeFormatOptions;
}

export enum WeekDays {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export const WeekDaysShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export class OpeningHours {
    static readonly defaultOptions: OpeningHoursOptions = {
        fromUntilSeparator: ' - ',
        weekStart: WeekDays.Sunday,
        weekDays: WeekDaysShort,
        currentDate: new Date(),
        currentDayOnTop: false,
        locales: 'de-DE',
    };

    private times: Map<WeekDays, OpenTimeInternal[]>;
    private options: OpeningHoursOptions;

    get isOpen() {
        return false;
    }

    constructor(options: OpeningHoursOptions = {}) {
        this.options = { ...OpeningHours.defaultOptions, ...options };
        this.times = new Map<WeekDays, OpenTimeInternal[]>([
            [WeekDays.Sunday, []],
            [WeekDays.Monday, []],
            [WeekDays.Tuesday, []],
            [WeekDays.Wednesday, []],
            [WeekDays.Thursday, []],
            [WeekDays.Friday, []],
            [WeekDays.Saturday, []],
        ]);
    }

    /**
     * add a single time object and optimize it
     * @param day 
     * @param from 
     * @param until 
     */
    add(day: WeekDays, from: DateType, until: DateType) {
        const time = { day, from, until }
        const optimized = this.preOptimize(time);
        this.addIfNotExist(optimized);
        this.postOptimize();
    }

    /**
     * loading a list of time objects and optimize them
     * @param times 
     */
    load(times: OpenTimeInput[]) {
        this.times.clear();
        for (const time of times) {
            const optimized = this.preOptimize(time);
            this.addIfNotExist(optimized);
        }
        this.postOptimize();
    }

    toJSON() {
        const result: OpenTimeOutput[] = [];
        for (const [day, times] of this.times.entries()) {
            if (times.length === 0) {
                continue;
            }
            result.push(...times
                .map(time => {
                    const from = this.getTimeByCurrentDay(time.from).toISOString();
                    const until = this.getTimeByCurrentDay(time.until).toISOString();
                    return { day, from, until };
                }))
        }
        return result;
    }

    /**
     * Creates an array output for opening hours.
     * @param date force the given day at the top of the list
     */
    toLocaleJSON(options: OpeningHoursOptions = {}): OpenTimeResultOutput[] {
        options = { ...this.options, ...options };
        const { currentDate, locales } = options;
        const openTimes = [];
        for (const [day, times] of this.times.entries()) {
            if (times.length === 0) {
                openTimes[day] = null;
                continue;
            }
            const active = currentDate?.getDay() === day;
            openTimes[day] = {
                active,
                day,
                times: times
                    .map(time => {
                        const from = time.from.toLocaleTimeString(locales, this.options.formatOptions);
                        const until = time.until.toLocaleTimeString(locales, this.options.formatOptions);
                        return { day, from, until };
                    }),
            };
        }

        this.setCurrentDayOnTop(openTimes, options);
        const result = [];
        for (const item of openTimes) {
            if (item) {
                result.push(item);
            }
        }
        return result as OpenTimeResultOutput[];
    }

    /**
     * Creates a string output for opening hours.
     * @param date force the given day at the top of the list
     */
    toString(options: OpeningHoursOptions = {}) {
        options = { ...this.options, ...options };
        const { currentDate, fromUntilSeparator, locales } = options;
        const openTimes = [];
        const weekDays = this.options.weekDays || WeekDaysShort;
        for (const [day, times] of this.times.entries()) {
            if (times.length === 0) {
                openTimes[day] = '';
                continue;
            }
            const active = currentDate?.getDay() === day;
            const timeStr = times
                .map(time => {
                    const from = time.from.toLocaleTimeString(locales, this.options.formatOptions);
                    const until = time.until.toLocaleTimeString(locales, this.options.formatOptions);
                    return from + fromUntilSeparator + until;
                });

            const resultStr = `${weekDays[day]} ${timeStr.join(', ')}`;
            openTimes[day] = active ? '[' + resultStr + ']' : resultStr;
        }

        this.setCurrentDayOnTop(openTimes, options);
        const result = [];
        for (const item of openTimes) {
            if (item) {
                result.push(item);
            }
        }
        return result.join('\n');
    }

    private getTimeByCurrentDay(date: Date | [number, number, number, number]) {
        const { currentDate } = this.options;
        const now = currentDate || new Date();
        const [day, hours, minutes, seconds] = Array.isArray(date) ? date : [
            date.getDay(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        ];
        const offset = day - now.getDay();
        return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
            hours,
            minutes,
            seconds
        );
    }

    private setCurrentDayOnTop<T>(result: T[], options: OpeningHoursOptions) {
        const { currentDate, currentDayOnTop, weekStart } = options;
        const weekDay = currentDate && currentDayOnTop ? currentDate.getDay() :
            weekStart !== undefined ? weekStart : 0;
        if (weekDay > 0) {
            const prefix = result.splice(weekDay);
            result.unshift(...prefix);
        }
    }

    /**
     * add new time entry if it does not exist
     * @param optimizedTimes 
     */
    private addIfNotExist(optimizedTimes: OpenTimeInternal[]) {
        for (const time of optimizedTimes) {
            if (this.times.has(time.from.getDay())) {
                const times = this.times.get(time.from.getDay());
                times?.push(time);
            } else {
                this.times.set(time.from.getDay(), [time]);
            }
        }
    }

    private normalizeTimeString(time: Date | number | string, day: WeekDays, pattern = /\d{1,2}/g) {
        const date = new Date(time);
        if ('Invalid Date' !== date.toString() && 'string' === typeof time && time.length === 24) {
            return this.getTimeByCurrentDay(date);
        }
        else if ('string' === typeof time) {
            const matched = time.match(pattern);
            if (matched) {
                let [hours, minutes, seconds] = matched.slice(0, 3).map(n => parseInt(n));
                if ('undefined' === typeof seconds) {
                    seconds = 0;
                }
                if (hours === 24 && minutes === 0) {
                    hours = 0;
                }
                if (hours === 23 && minutes === 59) {
                    hours = 0;
                    minutes = 0;
                }
                const date = this.getTimeByCurrentDay([day, hours, minutes, seconds]);
                if (date.getDay() !== day) {
                    date.setDate(date.getDate() - 1);
                }
                return date;
            }
        }
        throw new Error(`Invalid time string: ${time}`);
    }

    private normalizeUntilDate(date: Date) {
        if (date.getHours() === 0 && date.getMinutes() === 0) {
            date.setHours(23);
            date.setMinutes(59);
        }
    }

    /**
     * normalize the end-of-day behavior
     * @param time
     */
    private preOptimize(time: OpenTimeInput, removePattern?: RegExp): OpenTimeInternal[] {
        const internal: OpenTimeInternal = {
            from: this.normalizeTimeString(time.from, time.day, removePattern),
            until: this.normalizeTimeString(time.until, time.day, removePattern)
        }
        this.normalizeUntilDate(internal.until);

        internal.from.setDate(internal.from.getDate());
        internal.until.setDate(internal.until.getDate());

        if (internal.until < internal.from) {
            internal.until.setDate(internal.until.getDate() + 1);
            return [
                {
                    from: internal.from,
                    until: this.getTimeByCurrentDay([internal.from.getDay(), 23, 59, 0])
                },
                {
                    from: this.getTimeByCurrentDay([internal.until.getDay(), 0, 0, 0]),
                    until: internal.until
                }
            ];
        }
        return [internal];
    }

    /**
     * sort and merge the opening hours times.
     */
    private postOptimize() {
        for (const [day, times] of this.times.entries()) {
            this.sort(times);
            this.merge(times);
            this.times.set(day, times);
        }
    }

    /**
     * sort time objects
     * @param times 
     */
    private sort(times: OpenTimeInternal[]) {
        times.sort((a, b) => a.from < b.from || a.until < b.from ? -1 : a.from > b.until ? 1 : 0);
    }

    /**
     * merge overlapping times
     * @param times 
     */
    private merge(times: OpenTimeInternal[]) {
        const tmp = times.splice(0);
        let last!: OpenTimeInternal;
        for (const time of tmp) {
            if (!last || time.from > last.until) {
                times.push(time);
                last = time;
            } else {
                if (time.until > last.until) {
                    last.until = time.until;
                }
                if (time.from < last.from) {
                    last.from = time.from;
                }
            }
        }
    }

}
