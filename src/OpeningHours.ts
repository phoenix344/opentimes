
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

export declare interface OpenTimeRemovableInput {
    day?: WeekDays;
    days?: WeekDays[];
    from?: DateType;
    until?: DateType;
    spans?: Array<{ from?: DateType, until?: DateType }>;
}

export declare interface OpenTimeOutput {
    day: WeekDays;
    from: string;
    until: string;
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
    weekStart?: WeekDays;
    currentDate?: Date;
    currentDayOnTop?: boolean;
    locales?: string;
    dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
    showClosedDays?: boolean;
    text?: {
        timespanSeparator?: string;
        weekDays?: string[];
        closed?: string;
    };
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
        weekStart: WeekDays.Monday,
        currentDate: new Date(),
        currentDayOnTop: false,
        locales: 'de-DE',
        dateTimeFormatOptions: {
            timeZone: "Europe/Berlin",
            hour: "2-digit",
            minute: "2-digit"
        },
        text: {
            closed: 'closed',
            timespanSeparator: ' - ',
            weekDays: WeekDaysShort
        }
    };

    private times: Array<OpenTimeInternal[]>;
    private options: OpeningHoursOptions;
    private text: {
        timespanSeparator: string;
        weekDays: string[];
        closed: string;
        break: string;
    };

    get isOpen() {
        return false;
    }

    constructor(options: OpeningHoursOptions = {}) {
        // prepare options
        this.options = { ...OpeningHours.defaultOptions, ...options };

        // prepare translations object
        this.text = {
            ...(OpeningHours.defaultOptions.text || {}),
            ...this.options.text
        } as never;

        // setup a 2D array for 7 days, started by sunday.
        this.times = [[], [], [], [], [], [], []];
    }

    /**
     * add a single time object and optimize it
     * @param day 
     * @param from 
     * @param until 
     */
    add(day: WeekDays, from: DateType, until: DateType) {
        const time = { day, from, until };
        const optimized = this.optimize(time);
        this.addIfNotExist(optimized);
        this.postOptimize();
    }

    cut(days: WeekDays | WeekDays[], from: DateType, until: DateType) {
        if ('number' === typeof days) {
            days = [days];
        }
        const optimized = [];
        for (const day of days) {
            const time = { day, from, until };
            // The second value (if exists) in the optimized array is the
            // time after midnight from the next day. This must not be
            // used in this case, so we avoid wrong remove operations.
            optimized.push(this.optimize(time).shift() as OpenTimeInternal);
        }
        this.cutOut(optimized);
        this.postOptimize();
    }

    cutMulti(removables: Array<OpenTimeRemovableInput>) {
        const optimizedRemovables: OpenTimeInternal[] = [];
        for (const removable of removables) {
            const days = [];
            const times = [];
            if ('undefined' !== typeof removable.days) {
                days.push(...removable.days);
            } else if ('number' === typeof removable.day) {
                days.push(removable.day);
            }

            if ('undefined' !== typeof removable.spans) {
                for (const span of removable.spans) {
                    for (const day of days) {
                        times.push({
                            day,
                            from: span.from || '0000',
                            until: span.until || '2359'
                        });
                    }
                }
            } else {
                for (const day of days) {
                    times.push({
                        day,
                        from: removable.from || '0000',
                        until: removable.until || '2359'
                    });
                }
            }

            for (const time of times) {
                optimizedRemovables.push(this.optimize(time).shift() as OpenTimeInternal);
            }
        }

        this.cutOut(optimizedRemovables);

        this.postOptimize();
    }

    /**
     * loading a list of time objects and optimize them
     * @param times 
     */
    load(times: OpenTimeInput[]) {
        this.times.forEach(times => times.splice(0));
        for (const time of times) {
            const optimized = this.optimize(time);
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
                    const from = this.convertToSimpleFormat(time.from);
                    const until = this.convertToSimpleFormat(time.until);
                    return { day, from, until };
                }));
        }
        return result;
    }

    /**
     * Creates an array output for opening hours.
     */
    toLocaleJSON(options: OpeningHoursOptions = {}): OpenTimeResultOutput[] {
        options = { ...this.options, ...options };
        const { currentDate, locales } = options;
        const openTimes = [];
        for (const [day, times] of this.times.entries()) {
            const active = currentDate?.getDay() === day;
            if (times.length === 0) {
                // create an object if showClosedDays is enabled.
                openTimes[day] = options.showClosedDays ? {
                    active,
                    day: (this.text.weekDays as string[])[day],
                    times: []
                } : null;
            } else {
                // insert opening hours with the correct time format and
                // add the translation of the current day.
                openTimes[day] = {
                    active,
                    day: (this.text.weekDays as string[])[day],
                    times: times
                        .map(time => {
                            const from = time.from.toLocaleTimeString(locales, this.options.dateTimeFormatOptions);
                            const until = time.until.toLocaleTimeString(locales, this.options.dateTimeFormatOptions);
                            return { from, until };
                        }),
                };
            }
        }

        // reorder openTimes array to set the currently
        // leading week day at the top.
        this.setLeadingDay(openTimes, options);
        const result = [];

        // discard empty days
        for (const item of openTimes) {
            if (item) {
                result.push(item);
            }
        }
        return result as OpenTimeResultOutput[];
    }

    /**
     * Creates a string output for opening hours.
     */
    toString(options: OpeningHoursOptions = {}) {
        const result = [];

        // load output data and format it into a text
        // output.
        const openTimes = this.toLocaleJSON(options)
        for (const obj of openTimes) {
            let resultStr: string;
            if (obj.times.length) {
                resultStr = `${obj.day} ${obj.times.map(time => (
                    time.from +
                    this.text.timespanSeparator +
                    time.until
                )).join(', ')}`;
            } else {
                resultStr = `${obj.day} ${this.text.closed}`;
            }
            result.push(obj.active ? '[' + resultStr + ']' : resultStr);
        }
        return result.join('\n');
    }

    private isOpenTimeInput(obj: unknown): obj is OpenTimeInput {
        return obj !== null && 'number' === typeof (obj as OpenTimeInput).day;
    }

    private isOpenTimeRemovableInput(obj: unknown): obj is OpenTimeRemovableInput {
        return obj !== null && 'undefined' !== typeof (obj as OpenTimeRemovableInput).days;
    }

    /**
     * Creates a date object from currentDate and the given
     * opening hours time.
     */
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

    /**
     * defines the leading week day by
     * currentDayOnTop and weekStart options.
     */
    private setLeadingDay<T>(result: T[], options: OpeningHoursOptions) {
        const { currentDate, currentDayOnTop, weekStart } = options;
        const weekDay = currentDate && currentDayOnTop ? currentDate.getDay() :
            weekStart !== undefined ? weekStart : 0;
        if (weekDay > 0) {
            const previous = result.splice(weekDay);
            result.unshift(...previous);
        }
    }

    /**
     * add new time entry if it does not exist
     */
    private addIfNotExist(optimizedTimes: OpenTimeInternal[]) {
        for (const time of optimizedTimes) {
            const times = this.times[time.from.getDay()];
            times.push(time);
        }
    }

    /**
     * this method is the magical unicorn that gets all the funky shit done!
     * - Interpreting Date, Unix Timestamp, ISO 8601 DateTime => CHECK
     * - Interpreting fuzzy 24h time strings => CHECK
     */
    private normalizeTimeString(time: Date | number | string, day: WeekDays, pattern = /\d{1,2}/g) {
        const date = new Date(time);
        if ('Invalid Date' !== date.toString() && 'string' === typeof time && 24 === time.length) {
            return this.getTimeByCurrentDay(date);
        }
        else if ('string' === typeof time) {
            const matched = time.match(pattern);
            if (matched) {
                let [hours, minutes, seconds] = matched.slice(0, 3).map(n => parseInt(n));

                // make sure second has a valid value.
                if ('undefined' === typeof seconds) {
                    seconds = 0;
                }

                // I'm zeroing the values 24:00 and 23:59,
                // because I need a solid foundation to
                // normalize for after midnight

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

    private convertToSimpleFormat(date: Date) {
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return ('00' + hours).slice(hours.length) +
            ('00' + minutes).slice(minutes.length) +
            (seconds !== '0' ?
                ('00' + seconds).slice(seconds.length) : '');
    }

    /**
     * normalize the end-of-day behavior
     * @param time
     */
    private optimize(time: OpenTimeInput, removePattern?: RegExp): OpenTimeInternal[] {
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
        for (const times of this.times.values()) {
            this.sort(times);
            this.merge(times);
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
            } else if (time.until > last.until) {
                last.until = time.until;
            }
        }
    }

    private cutOut(removables: OpenTimeInternal[]) {
        for (const removable of removables) {
            const times = this.times[removable.from.getDay()];
            const tmp = times.splice(0);
            for (const time of tmp) {
                // no remove operation needed
                if (time.from > removable.until || time.until < removable.from) {
                    times.push(time);
                }

                // cut in two time objects
                else if (time.from < removable.from && time.until > removable.until) {
                    times.push({
                        from: time.from,
                        until: removable.from
                    }, {
                        from: removable.until,
                        until: time.until
                    });
                }

                // cut start time (from)
                else if (time.from >= removable.from && time.from <= removable.until && time.until > removable.until) {
                    times.push({
                        from: removable.until,
                        until: time.until
                    });
                }

                // cut end time (until)
                else if (time.until <= removable.until && time.until >= removable.from && time.from < removable.from) {
                    times.push({
                        from: time.from,
                        until: removable.from
                    });
                }
            }
        }
    }

}
