import { OpeningHoursOptions } from "../interfaces";
import { WeekDays, WeekDaysShort } from "../WeekDays";
import { DisplayTextConverter } from "./DisplayTextConverter";

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

describe("DisplayJsonConverter", () => {
  it("::toData(input, options?)", () => {
    const converter = new DisplayTextConverter();
    const result = converter.toData(
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
            text: "test",
          },
        ],
        [
          /** wednesday */
        ],
        [
          /** thursday */
        ],
        [
          /** friday */
        ],
        [
          /** saturday */
        ],
      ],
      defaultOptions
    );

    expect(result).toBe(
      "mon 08:00 - 14:00" + "\n" + "[tue 08:00 - 12:00, 12:30 - 17:30]"
    );
  });

  it("::fromData(input, options?)", () => {
    const converter = new DisplayTextConverter();

    expect(() =>
      converter.fromData(
        "mon 08:00 - 14:00" + "\n" + "[tue 08:00 - 12:00, 12:30 - 17:30]",
        defaultOptions
      )
    ).toThrow("Not supported!");
  });
});
