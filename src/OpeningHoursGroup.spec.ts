import { OpeningHours, OpeningHoursOptions } from "./OpeningHours";
import { OpeningHoursGroup } from "./OpeningHoursGroup";

const defaultOptions: OpeningHoursOptions = {
  currentDate: new Date(2020, 8, 7),
  currentDayOnTop: false,
  locales: "de-DE",
  dateTimeFormatOptions: {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  },
};

describe.skip("blah", () => {
  let openingHours: OpeningHours;

  beforeEach(() => {
    openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0800", until: "1600" },
      { day: 2, from: "0800", until: "1600" },
      { day: 3, from: "0800", until: "1600" },
      { day: 4, from: "0800", until: "1600" },
      { day: 5, from: "0800", until: "1600" },
      { day: 6, from: "0800", until: "1600" },
    ]);
  });

  it("tests normalized output from toJSON()", () => {
    const group = new OpeningHoursGroup({ openingHours });
    group.add({
      fromDate: new Date(2020, 8, 8),
      untilDate: new Date(2020, 8, 8),
      text: "holidays",
    });
    expect(group.toJSON()).toStrictEqual({
      default: [
        { day: 1, from: "0800", until: "1600" },
        { day: 2, from: "0800", until: "1600" },
        { day: 3, from: "0800", until: "1600" },
        { day: 4, from: "0800", until: "1600" },
        { day: 5, from: "0800", until: "1600" },
        { day: 6, from: "0800", until: "1600" },
      ],
      exceptions: [
        {
          fromDate: "2020-09-06",
          untilDate: "2020-09-06",
          text: "holidays",
          openingHours: undefined,
        },
      ],
    });
  });

  it("tests toLocaleJSON()", () => {
    const group = new OpeningHoursGroup({ openingHours });
    group.add({
      fromDate: new Date(2020, 8, 8),
      untilDate: new Date(2020, 8, 8),
      text: "holidays",
    });
    expect(group.toLocaleJSON()).toBe({});
  });

  it("should work", () => {
    const group = new OpeningHoursGroup({ openingHours });
    group.add({
      fromDate: new Date(2020, 8, 8),
      untilDate: new Date(2020, 8, 8),
      text: "holidays",
    });
    expect(group.toString()).toBe(
      "mon 08:00 - 16:00\n" +
        "holidays\n" +
        "wed 08:00 - 16:00\n" +
        "thu 08:00 - 16:00\n" +
        "fri 08:00 - 16:00\n" +
        "sat 08:00 - 16:00"
    );
  });
});
