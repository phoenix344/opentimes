import { OpeningHoursOptions } from "../interfaces";
import { WeekDays, WeekDaysShort } from "../WeekDays";
import { MicrodataConverter } from "./MicrodataConverter";

const defaultOptions: OpeningHoursOptions = {
  weekStart: WeekDays.Monday,
  currentDate: new Date("2021-09-28T12:31:00"),
  currentDayOnTop: false,
  locales: "de-DE",
  dateTimeFormatOptions: {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  },
  text: {
    closed: "closed",
    timespanSeparator: " - ",
    weekDays: WeekDaysShort,
  },
  showClosedDays: false,
};

describe("Microdata converter", () => {
  it("creates single string output", () => {
    const microdata = new MicrodataConverter();
    const result = microdata.toData(
      [
        [
          /** sunday */
        ],
        [
          /** monday */
          {
            from: new Date("2021-09-28T06:00+0000"),
            until: new Date("2021-09-28T14:00+0200"),
          },
        ],
        [
          /** tuesday */
          {
            from: new Date("2021-09-28T06:00+0000"),
            until: new Date("2021-09-28T08:00-0200"),
          },
          {
            from: new Date("2021-09-28T10:30+0000"),
            until: new Date("2021-09-28T13:30-0200"),
          },
        ],
        [
          /** wednesday */
          {
            from: new Date("2021-09-29T06:00+0000"),
            until: new Date("2021-09-29T14:00+0200"),
          },
        ],
        [
          /** thursday */
          {
            from: new Date("2021-09-30T06:00+0000"),
            until: new Date("2021-09-30T14:00+0200"),
          },
        ],
        [
          /** friday */
          {
            from: new Date("2021-10-01T06:00+0000"),
            until: new Date("2021-10-01T14:00+0200"),
          },
        ],
        [
          /** saturday */
        ],
      ],
      defaultOptions
    );
    expect(result).toStrictEqual([
      "Mo,We-Fr 08:00-14:00",
      "Tu 08:00-12:00",
      "Tu 12:30-17:30",
    ]);
  });

  it("creates multiple string output", () => {
    const microdata = new MicrodataConverter();
    const result = microdata.fromData(
      ["Mo,We-Fr 08:00-14:00", "Tu 08:00-12:00", "Tu 12:30-17:30"],
      defaultOptions
    );

    expect(result).toStrictEqual([
      [
        /** sunday */
      ],
      [
        /** monday */
        {
          from: new Date("2021-09-27T06:00+0000"),
          until: new Date("2021-09-27T14:00+0200"),
        },
      ],
      [
        /** tuesday */
        {
          from: new Date("2021-09-28T06:00+0000"),
          until: new Date("2021-09-28T08:00-0200"),
        },
        {
          from: new Date("2021-09-28T10:30+0000"),
          until: new Date("2021-09-28T13:30-0200"),
        },
      ],
      [
        /** wednesday */
        {
          from: new Date("2021-09-29T06:00+0000"),
          until: new Date("2021-09-29T14:00+0200"),
        },
      ],
      [
        /** thursday */
        {
          from: new Date("2021-09-30T06:00+0000"),
          until: new Date("2021-09-30T14:00+0200"),
        },
      ],
      [
        /** friday */
        {
          from: new Date("2021-10-01T06:00+0000"),
          until: new Date("2021-10-01T14:00+0200"),
        },
      ],
      [
        /** saturday */
      ],
    ]);
  });
});
