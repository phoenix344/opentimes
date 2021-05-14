import { Converter } from "../Converter";
import { OpeningHoursOptions, OpenTimeResultOutput } from "../OpeningHours";

export class DisplayJson extends Converter<OpenTimeResultOutput[]> {
    convert(options: OpeningHoursOptions = {}) {
        options = { ...this.options, ...options };
        const format: Intl.DateTimeFormatOptions = { ...options.dateTimeFormatOptions };
        delete format.timeZone;

        const { currentDate, locales } = options;
        const { weekDays } = { ...this.openingHours.text,  ...(options.text || {}) };

        // make sure the timeZone is set with a value.
        // At least the local time of the current client.
        const { timeZone } = Intl.DateTimeFormat(
            this.options.locales,
            this.options.dateTimeFormatOptions).resolvedOptions();
        const current = this.normalizeLocalDate(currentDate as Date, timeZone);
        const openTimes = [];
        for (const [day, times] of this.openingHours.times.entries()) {
            const active = current.getDay() === day;
            if (times.length === 0) {
                // create an object if showClosedDays is enabled.
                openTimes[day] = options.showClosedDays ? {
                    active,
                    day: weekDays[day],
                    times: []
                } : null;
            } else {
                // insert opening hours with the correct time format and
                // add the translation of the current day.
                openTimes[day] = {
                    active,
                    day: weekDays[day],
                    times: times
                        .map(time => {
                            const from = time.from.toLocaleTimeString(locales, format);
                            const until = time.until.toLocaleTimeString(locales, format);
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


    private normalizeLocalDate(date: Date, timeZone?: string | undefined) {
        // Hack: I'm using the "sv" locale from sweden,
        // because it's similar to the ISO DateTime format.
        const result = date.toLocaleString('sv', { timeZone });
        return new Date(result.replace(' ', 'T'));
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
}
