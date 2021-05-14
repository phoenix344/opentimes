import { OpeningHours, OpeningHoursOptions } from "OpeningHours";

export interface OpeningHoursException {
    fromDate: Date;
    untilDate: Date;
    id?: string;
    text?: string;
    openingHours?: OpeningHours;
    overwrite?: boolean | void;
}

export interface OpeningHoursGroupOptions {
    openingHours?: OpeningHours;
    currentDate?: Date;
    locales?: string;
    dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
}

export class OpeningHoursGroup {

    private static nextId = 1;

    private default!: OpeningHours;
    private exceptions: OpeningHoursException[] = [];

    constructor(private options: OpeningHoursGroupOptions = {}) {
        if (this.options.openingHours) {
            this.setDefault(this.options.openingHours);
        }
    }

    setDefault(openingHours: OpeningHours) {
        this.default = openingHours;
    }

    add(exception: OpeningHoursException) {
        const exceptions = this.removeExceptions(exception.fromDate, exception.untilDate, true);
        exception = {
            ...exception,
            id: exception.id !== undefined ? exception.id : 'ex' + (OpeningHoursGroup.nextId++),
            overwrite: exception.overwrite !== false
        };

        exceptions.push(exception);
        return exception.id;
    }

    remove(fromDate: Date, untilDate: Date) {
        this.removeExceptions(fromDate, untilDate, false);
    }

    removeById(id: string) {
        this.exceptions = this.exceptions.filter(ex => ex.id !== id);
    }

    toJSON() {
        // TODO: fix output
        return {
            default: this.default.toJSON(),
            exceptions: this.exceptions.map(ex => ({
                fromDate: ex.fromDate.toISOString().split('T')[0],
                untilDate: ex.untilDate.toISOString().split('T')[0],
                text: ex.text,
                openingHours: ex.openingHours?.toJSON(),
            })),
        };
    }

    toLocaleJSON(options?: OpeningHoursOptions) {
        const localeJSON = this.default.toLocaleJSON(options);
        
        // TODO: create machine readable output in JSON for current locale
        return localeJSON;
    }

    toString() {
        // TODO: create human readable output as text for current locale
        return '';
    }

    private removeExceptions(fromDate: Date, untilDate: Date, onlyOverwrite = false) {
        const exceptions = this.exceptions;
        const tmp = exceptions.splice(0);
        for (const ex of tmp) {
            if (
                onlyOverwrite &&
                (
                    ex.overwrite === false || 
                    ex.fromDate > untilDate || 
                    ex.untilDate < fromDate
                )
            ) {
                continue;
            }

            // cut exception in two parts
            else if (ex.fromDate < fromDate && ex.untilDate > untilDate) {
                const preUntilDate = new Date(fromDate);
                preUntilDate.setDate(preUntilDate.getDate() - 1);
                exceptions.push({
                    ...ex,
                    fromDate: new Date(ex.fromDate),
                    untilDate: preUntilDate,
                });

                const postFromDate = new Date(fromDate);
                postFromDate.setDate(postFromDate.getDate() + 1);
                exceptions.push({
                    ...ex,
                    fromDate: postFromDate,
                    untilDate: new Date(ex.untilDate),
                });
            }

            // cut start time (from)
            else if (ex.fromDate >= fromDate && ex.fromDate <= untilDate && ex.untilDate > untilDate) {
                const changedFromDate = new Date(fromDate);
                changedFromDate.setDate(fromDate.getDate() + 1);
                const untilDate = new Date(ex.fromDate);
                exceptions.push({ ...ex, fromDate: changedFromDate, untilDate });
            }

            // cut end time (until)
            else if (ex.untilDate <= untilDate && ex.untilDate >= fromDate && ex.fromDate < fromDate) {
                const fromDate = new Date(ex.fromDate);
                const changedUntilDate = new Date(untilDate);
                changedUntilDate.setDate(changedUntilDate.getDate() - 1);
                exceptions.push({ ...ex, fromDate, untilDate: changedUntilDate });
            }
        }
        return exceptions;
    }

}
