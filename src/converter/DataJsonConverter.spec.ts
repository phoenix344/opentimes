import { OpeningHoursOptions, WeekDays } from "../OpeningHours";
import { DataJsonConverter } from "./DataJsonConverter";

const defaultOptions: Partial<OpeningHoursOptions> = {
  currentDate: new Date("2021-09-29T12:00:00"),
  dateTimeFormatOptions: {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  },
};

describe("DataJsonConverter", () => {
  it("::convert(input, options?)", () => {
    const converter = new DataJsonConverter();
    const [monday, tuesdayMorning, tuesdayAfternoon] = converter.convert(
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

    expect(monday.day).toBe(WeekDays.Monday);
    expect(monday.from).toBe("0800");
    expect(monday.until).toBe("1400");
    expect(monday.text).toBeUndefined();

    expect(tuesdayMorning.day).toBe(WeekDays.Tuesday);
    expect(tuesdayMorning.from).toBe("0800");
    expect(tuesdayMorning.until).toBe("1200");
    expect(tuesdayMorning.text).toBeUndefined();

    expect(tuesdayAfternoon.day).toBe(WeekDays.Tuesday);
    expect(tuesdayAfternoon.from).toBe("1230");
    expect(tuesdayAfternoon.until).toBe("1730");
    expect(tuesdayAfternoon.text).toBe("test");
  });

  it("::parse(input, options?)", () => {
    const converter = new DataJsonConverter();
    const result = converter.parse(
      [
        {
          day: WeekDays.Monday,
          from: "0800",
          until: "1200",
        },
        {
          day: WeekDays.Tuesday,
          from: "0800",
          until: "1200",
        },
        {
          day: WeekDays.Tuesday,
          from: "1230",
          until: "1730",
          text: "test",
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
