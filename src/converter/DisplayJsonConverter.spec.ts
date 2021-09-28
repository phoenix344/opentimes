import { OpeningHoursOptions, WeekDays } from "../OpeningHours";
import { DisplayJsonConverter } from "./DisplayJsonConverter";

const defaultOptions: Partial<OpeningHoursOptions> = {
  currentDate: new Date("2021-09-28T12:31:00"),
  dateTimeFormatOptions: {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  },
};

describe("DisplayJsonConverter", () => {
  it("::convert(input, options?)", () => {
    const converter = new DisplayJsonConverter();
    const [monday, tuesday] = converter.convert(
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

  it("::parse(input, options?)", () => {
    const converter = new DisplayJsonConverter();
    const result = converter.parse(
      [
        {
          day: 'mon',
          active: false,
          times: [
            { from: "08:00", until: "14:00" }
          ]
        },
        {
          day: 'tue',
          active: true,
          times: [
            { from: "08:00", until: "12:00" },
            { from: "12:30", until: "17:30" },
          ]
        },
      ],
      defaultOptions
    );

    const [monday] = result[WeekDays.Monday];
    const [tuesdayMorning, tuesdayAfternoon] = result[WeekDays.Tuesday];

    expect(monday.from).toStrictEqual(new Date("2021-09-27T08:00:00"));
    expect(monday.until).toStrictEqual(new Date("2021-09-27T12:00:00"));

    expect(tuesdayMorning.from).toStrictEqual(new Date("2021-09-28T08:00:00"));
    expect(tuesdayMorning.until).toStrictEqual(new Date("2021-09-28T12:00:00"));

    expect(tuesdayAfternoon.from).toStrictEqual(
      new Date("2021-09-28T12:30:00")
    );
    expect(tuesdayAfternoon.until).toStrictEqual(
      new Date("2021-09-28T17:30:00")
    );
  });
});
