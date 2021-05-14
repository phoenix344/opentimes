import {OpeningHours, WeekDays} from '../OpeningHours';
import {Microdata} from './Microdata';

describe('Microdata', () => {
    it('creates single string output', () => {
        const openingHours = new OpeningHours();
        openingHours.add(WeekDays.Monday, '0:0', '0.0');
        openingHours.add(WeekDays.Tuesday, '00:00', '00:00');
        openingHours.add(WeekDays.Wednesday, '24:00', '00:00');
        openingHours.add(WeekDays.Friday, '00:00', '24:00');
        openingHours.add(WeekDays.Sunday, '23:59', '23:59');

        const microdata = new Microdata(openingHours);
        expect(microdata.convert()).toBe('Su-Th,Fr 00:00-23:59');
    });

    it('creates multiple string output', () => {
        const openingHours = new OpeningHours();
        openingHours.load([
            { "day": 1, "from": "0800", "until": "1600" },
            { "day": 2, "from": "0800", "until": "1600" },
            { "day": 3, "from": "0900", "until": "1200" },
            { "day": 4, "from": "0800", "until": "1600" },
            { "day": 5, "from": "0800", "until": "1600" },
            { "day": 6, "from": "1000", "until": "1400" }
        ]);

        const microdata = new Microdata(openingHours);
        expect(microdata.convert()).toStrictEqual([
            "Mo-Tu,We-Fr 08:00-16:00",
            "Th 09:00-12:00",
            "Sa 10:00-14:00"
        ]);
    });
})