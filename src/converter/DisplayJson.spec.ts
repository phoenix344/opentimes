import { OpeningHoursOptions } from "../interfaces";
import { WeekDays, WeekDaysShort } from "../WeekDays";
import { DisplayJson } from "./DisplayJson";

const defaultOptions: OpeningHoursOptions = {
  weekStart: WeekDays.Monday,
  currentDate: new Date("2021-09-28T12:31:00"),
  currentDayOnTop: false,
  locales: "de-DE",
  dateTimeFormatOptions: {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
  },
  text: {
    closed: "closed",
    open: "open",
    timespanSeparator: " - ",
    weekDays: WeekDaysShort,
  },
  showClosedDays: false,
};

describe("DisplayJson", () => {
  it("::toData(input, options?)", () => {
    const converter = new DisplayJson();
    const [monday, tuesday] = converter.toData(
      [
        [
          /** sunday */
        ],
        [
          /** monday */
          {
            from: new Date("2021-09-28T08:00"),
            until: new Date("2021-09-28T14:00"),
          },
        ],
        [
          /** tuesday */
          {
            from: new Date("2021-09-28T08:00"),
            until: new Date("2021-09-28T12:00"),
          },
          {
            from: new Date("2021-09-28T12:30"),
            until: new Date("2021-09-28T17:30"),
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

    expect(monday.day).toBe("mon");
    expect(monday.times[0].from).toBe("08:00");
    expect(monday.times[0].until).toBe("14:00");
    expect(monday.active).toBe(false);

    expect(tuesday.day).toBe("tue");
    expect(tuesday.times[0].from).toBe("08:00");
    expect(tuesday.times[0].until).toBe("12:00");
    expect(tuesday.times[1].from).toBe("12:30");
    expect(tuesday.times[1].until).toBe("17:30");
    expect(tuesday.active).toBe(true);
  });
});
