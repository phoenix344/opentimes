
import * as oh from './OpeningHours';

const defaultOptions: oh.OpeningHoursOptions = {
    currentDate: new Date(2020, 8, 6),
    currentDayOnTop: false,
    locales: 'de-DE',
    dateTimeFormatOptions: {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
    },
};

describe('options test', () => {
    it('midnight till midnight (00:00 - 00:00)', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);

        // fuzzy matching test for midnight
        openingHours.add(oh.WeekDays.Monday, '0:0', '0.0');
        openingHours.add(oh.WeekDays.Tuesday, '00:00', '00:00');
        openingHours.add(oh.WeekDays.Wednesday, '24:00', '00:00');
        openingHours.add(oh.WeekDays.Thursday, '23:59', '00:00');
        openingHours.add(oh.WeekDays.Friday, '00:00', '24:00');
        openingHours.add(oh.WeekDays.Saturday, '00:00', '23:59');
        openingHours.add(oh.WeekDays.Sunday, '23:59', '23:59');

        expect(openingHours.toString()).toBe(
            '[sun 00:00 - 23:59]\n' +
            'mon 00:00 - 23:59\n' +
            'tue 00:00 - 23:59\n' +
            'wed 00:00 - 23:59\n' +
            'thu 00:00 - 23:59\n' +
            'fri 00:00 - 23:59\n' +
            'sat 00:00 - 23:59'
        );
    });
    it('midnight till midnight (current date is tuesday)', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDate: new Date(2020, 8, 8)
        });

        // fuzzy matching test for midnight
        openingHours.add(oh.WeekDays.Monday, '0000', '0000');
        openingHours.add(oh.WeekDays.Tuesday, '2359', '2400');
        openingHours.add(oh.WeekDays.Wednesday, '24-00', '00/00');
        openingHours.add(oh.WeekDays.Thursday, '000', '240');
        openingHours.add(oh.WeekDays.Friday, '00:00', '24:00');
        openingHours.add(oh.WeekDays.Saturday, '00:00', '23:59');
        openingHours.add(oh.WeekDays.Sunday, '23:59', '23:59');

        expect(openingHours.toString()).toBe(
            'sun 00:00 - 23:59\n' +
            'mon 00:00 - 23:59\n' +
            '[tue 00:00 - 23:59]\n' +
            'wed 00:00 - 23:59\n' +
            'thu 00:00 - 23:59\n' +
            'fri 00:00 - 23:59\n' +
            'sat 00:00 - 23:59'
        );
    });
    it('midnight till midnight (weekStart / it\'s wednesday my dudes!)', () => {
        const openingHours = new oh.OpeningHours({ ...defaultOptions, weekStart: oh.WeekDays.Wednesday });
        openingHours.add(oh.WeekDays.Monday, '0:0', '0.0');
        openingHours.add(oh.WeekDays.Tuesday, '00:00', '00:00');
        openingHours.add(oh.WeekDays.Wednesday, '24:00', '00:00');
        openingHours.add(oh.WeekDays.Thursday, '23:59', '00:00');
        openingHours.add(oh.WeekDays.Friday, '00:00', '24:00');
        openingHours.add(oh.WeekDays.Saturday, '00:00', '23:59');
        openingHours.add(oh.WeekDays.Sunday, '23:59', '23:59');

        expect(openingHours.toString()).toBe(
            'wed 00:00 - 23:59\n' +
            'thu 00:00 - 23:59\n' +
            'fri 00:00 - 23:59\n' +
            'sat 00:00 - 23:59\n' +
            '[sun 00:00 - 23:59]\n' +
            'mon 00:00 - 23:59\n' +
            'tue 00:00 - 23:59'
        );
    });
    it('midnight till midnight (current date on top / it\'s wednesday my dudes!)', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDayOnTop: true,
            currentDate: new Date(2020, 8, 9)
        });
        openingHours.add(oh.WeekDays.Monday, '0:0', '0.0');
        openingHours.add(oh.WeekDays.Tuesday, '00:00', '00:00');
        openingHours.add(oh.WeekDays.Wednesday, '24:00', '00:00');
        openingHours.add(oh.WeekDays.Thursday, '23:59', '00:00');
        openingHours.add(oh.WeekDays.Friday, '00:00', '24:00');
        openingHours.add(oh.WeekDays.Saturday, '00:00', '23:59');
        openingHours.add(oh.WeekDays.Sunday, '23:59', '23:59');

        expect(openingHours.toString()).toBe(
            '[wed 00:00 - 23:59]\n' +
            'thu 00:00 - 23:59\n' +
            'fri 00:00 - 23:59\n' +
            'sat 00:00 - 23:59\n' +
            'sun 00:00 - 23:59\n' +
            'mon 00:00 - 23:59\n' +
            'tue 00:00 - 23:59'
        );
    });
    it('after midnight (22:00 - 03:00)', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.add(oh.WeekDays.Monday, '2200', '0300');
        expect(openingHours.toString()).toBe(
            'mon 22:00 - 23:59\n' +
            'tue 00:00 - 03:00'
        );
    });

    it('overlap times', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.add(oh.WeekDays.Monday, '0000', '0100');
        openingHours.add(oh.WeekDays.Monday, '0030', '0200');
        openingHours.add(oh.WeekDays.Monday, '0300', '0400');
        openingHours.add(oh.WeekDays.Monday, '0330', '0500');
        openingHours.add(oh.WeekDays.Monday, '0700', '0800');
        openingHours.add(oh.WeekDays.Monday, '0600', '0900');
        
        expect(openingHours.toString()).toBe(
            'mon 00:00 - 02:00, 03:00 - 05:00, 06:00 - 09:00'
        );
    });
});

describe('add(weekDay, "h:mm", "h:mm") - after current date', () => {
    it('toString', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.add(oh.WeekDays.Monday, '8:30', '14:30');
        openingHours.add(oh.WeekDays.Monday, '15:00', '20:00');
        expect(openingHours.toString()).toBe('mon 08:30 - 14:30, 15:00 - 20:00');
    });

    it('toJSON', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.add(oh.WeekDays.Monday, '8:30', '14:30');
        openingHours.add(oh.WeekDays.Monday, '15:00', '20:00');
        expect(openingHours.toJSON()).toStrictEqual([{
            "day": 1,
            "from": "0830",
            "until": "1430"
        },
        {
            "day": 1,
            "from": "1500",
            "until": "2000"
        }]);
    });

    it('toLocaleJSON', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.add(oh.WeekDays.Monday, '8:30', '14:30');
        openingHours.add(oh.WeekDays.Monday, '15:00', '20:00');
        expect(openingHours.toLocaleJSON()).toStrictEqual([{
            "active": false,
            "day": "mon",
            "times": [
                {
                    "from": "08:30",
                    "until": "14:30"
                }, {
                    "from": "15:00",
                    "until": "20:00"
                }
            ]
        }]);
    });
});

describe('add(weekDay, "h:mm", "h:mm") - current date', () => {
    it('toString', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDate: new Date(2020, 8, 7),
        });
        openingHours.add(oh.WeekDays.Monday, '8:30', '14:30');
        openingHours.add(oh.WeekDays.Monday, '15:00', '20:00');
        expect(openingHours.toString()).toBe('[mon 08:30 - 14:30, 15:00 - 20:00]');
    });

    it('toLocaleJSON', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDate: new Date(2020, 8, 7),
        });
        openingHours.add(oh.WeekDays.Monday, '8:30', '14:30');
        openingHours.add(oh.WeekDays.Monday, '15:00', '20:00');
        expect(openingHours.toLocaleJSON()).toStrictEqual([{
            "active": true,
            "day": "mon",
            "times": [
                {
                    "from": "08:30",
                    "until": "14:30"
                }, {
                    "from": "15:00",
                    "until": "20:00"
                }
            ]
        }]);
    });
});

describe('load(Array<{day, from: ISOString, until: ISOString}>) - after current date', () => {
    it('toString', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.load([
            { "day": 1, "from": "2020-09-07T06:30:00.000Z", "until": "2020-09-07T12:30:00.000Z" },
            { "day": 1, "from": "2020-09-07T13:00:00.000Z", "until": "2020-09-07T18:00:00.000Z" }
        ]);
        expect(openingHours.toString()).toBe('mon 08:30 - 14:30, 15:00 - 20:00');
    });

    it('toJSON', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.load([
            { "day": 1, "from": "2020-09-07T06:30:00.000Z", "until": "2020-09-07T12:30:00.000Z" },
            { "day": 1, "from": "2020-09-07T13:00:00.000Z", "until": "2020-09-07T18:00:00.000Z" }
        ]);
        expect(openingHours.toJSON()).toStrictEqual([{
            "day": 1,
            "from": "0830",
            "until": "1430"
        },
        {
            "day": 1,
            "from": "1500",
            "until": "2000"
        }]);
    });

    it('toLocaleJSON', () => {
        const openingHours = new oh.OpeningHours(defaultOptions);
        openingHours.load([
            { "day": 1, "from": "2020-09-07T06:30:00.000Z", "until": "2020-09-07T12:30:00.000Z" },
            { "day": 1, "from": "2020-09-07T13:00:00.000Z", "until": "2020-09-07T18:00:00.000Z" }
        ]);
        expect(openingHours.toLocaleJSON()).toStrictEqual([{
            "active": false,
            "day": "mon",
            "times": [
                {
                    "from": "08:30",
                    "until": "14:30"
                }, {
                    "from": "15:00",
                    "until": "20:00"
                }
            ]
        }]);
    });
});

describe('load(Array<{day, from: ISOString, until: ISOString}>) - current date', () => {
    it('toString', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDate: new Date(2020, 8, 7),
        });
        openingHours.load([
            { "day": 1, "from": "2020-09-07T06:30:00.000Z", "until": "2020-09-07T12:30:00.000Z" },
            { "day": 1, "from": "2020-09-07T13:00:00.000Z", "until": "2020-09-07T18:00:00.000Z" }
        ]);
        expect(openingHours.toString()).toBe('[mon 08:30 - 14:30, 15:00 - 20:00]');
    });

    it('toLocaleJSON', () => {
        const openingHours = new oh.OpeningHours({
            ...defaultOptions,
            currentDate: new Date(2020, 8, 7),
        });
        openingHours.load([
            { "day": 1, "from": "0830", "until": "1430" },
            { "day": 1, "from": "1500", "until": "2000" }
        ]);
        expect(openingHours.toLocaleJSON()).toStrictEqual([{
            "active": true,
            "day": "mon",
            "times": [
                {
                    "from": "08:30",
                    "until": "14:30"
                }, {
                    "from": "15:00",
                    "until": "20:00"
                }
            ]
        }]);
    });
});
