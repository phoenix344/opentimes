import { OpeningHours } from "OpeningHours";

export interface OpeningHoursException {
    fromDate: Date;
    untilDate: Date;
    id?: string;
    text?: string;
    openingHours?: OpeningHours;
    overwrite?: boolean | void;
}

export class OpeningHoursGroup {

    private static nextId = 1;

    private default!: OpeningHours;
    private exceptions: OpeningHoursException[] = [];

    constructor(openingHours?: OpeningHours) {
        if (openingHours) {
            this.setDefault(openingHours);
        }
    }

    setDefault(openingHours: OpeningHours) {
        this.default = openingHours;
    }

    add(exception: OpeningHoursException) {
        const exceptions = this.exceptions;
        const tmp = exceptions.splice(0);
        for (const ex of tmp) {
            if (
                ex.overwrite === false || 
                ex.fromDate > exception.untilDate || 
                ex.untilDate < exception.fromDate
            ) {
                continue;
            }

            // cut exception in two parts
            else if (ex.fromDate < exception.fromDate && ex.untilDate > exception.untilDate) {
                const preUntilDate = new Date(exception.fromDate);
                preUntilDate.setDate(preUntilDate.getDate() - 1);
                exceptions.push({
                    ...ex,
                    fromDate: new Date(ex.fromDate),
                    untilDate: preUntilDate,
                });

                const postFromDate = new Date(exception.fromDate);
                postFromDate.setDate(postFromDate.getDate() + 1);
                exceptions.push({
                    ...ex,
                    fromDate: postFromDate,
                    untilDate: new Date(ex.untilDate),
                });
            }

            // cut start time (from)
            else if (ex.fromDate >= exception.fromDate && ex.fromDate <= exception.untilDate && ex.untilDate > exception.untilDate) {
                const fromDate = new Date(exception.fromDate);
                fromDate.setDate(fromDate.getDate() + 1);
                const untilDate = new Date(ex.fromDate);
                exceptions.push({ ...ex, fromDate, untilDate });
            }

            // cut end time (until)
            else if (ex.untilDate <= exception.untilDate && ex.untilDate >= exception.fromDate && ex.fromDate < exception.fromDate) {
                const fromDate = new Date(ex.fromDate);
                const untilDate = new Date(exception.fromDate);
                untilDate.setDate(untilDate.getDate() - 1);
                exceptions.push({ ...ex, fromDate, untilDate });
            }
        }

        exception = {
            ...exception,
            id: exception.id !== undefined ? exception.id : 'ex' + (OpeningHoursGroup.nextId++),
            overwrite: exception.overwrite !== false
        };

        exceptions.push(exception);
        return exception.id;
    }

    remove(fromDate: Date, untilDate: Date) {
        // TODO: remove operation by date
    }

    removeById(id: string) {
        this.exceptions = this.exceptions.filter(ex => ex.id !== id);
    }

    toJSON() {
        return {
            default: this.default.toJSON(),
            exceptions: this.exceptions.map(ex => ({
                ...ex,
                openingHours: ex.openingHours?.toJSON(),
            })),
        };
    }

    toLocaleJSON() {
        // TODO: create machine readable output in JSON for current locale
        return {};
    }

    toString() {
        // TODO: create human readable output as text for current locale
        return '';
    }

}
