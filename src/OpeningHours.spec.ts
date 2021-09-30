import { OpeningHoursOptions } from "./interfaces";
import { OpeningHours } from "./OpeningHours";
import { WeekDays } from "./WeekDays";
import { OpenState } from "./OpenState";

const defaultOptions: Partial<OpeningHoursOptions> = {
  currentDate: new Date("2020-09-06"),
  currentDayOnTop: false,
  locales: "de-DE",
  dateTimeFormatOptions: {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  },
};

describe("options test", () => {
  it("midnight till midnight (00:00 - 00:00)", () => {
    const openingHours = new OpeningHours(defaultOptions);

    // fuzzy matching test for midnight
    openingHours.add(WeekDays.Monday, "0:0", "0.0");
    openingHours.add(WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(WeekDays.Friday, "00:00", "24:00");
    openingHours.add(WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(WeekDays.Sunday, "23:59", "23:59");

    expect(openingHours.toString()).toBe(
      "mon 00:00 - 23:59\n" +
        "tue 00:00 - 23:59\n" +
        "wed 00:00 - 23:59\n" +
        "thu 00:00 - 23:59\n" +
        "fri 00:00 - 23:59\n" +
        "sat 00:00 - 23:59\n" +
        "[sun 00:00 - 23:59]"
    );
  });
  it("midnight till midnight (current date is tuesday)", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 8),
    });

    // fuzzy matching test for midnight
    openingHours.add(WeekDays.Monday, "0000", "0000");
    openingHours.add(WeekDays.Tuesday, "2359", "2400");
    openingHours.add(WeekDays.Wednesday, "24-00", "00/00");
    openingHours.add(WeekDays.Thursday, "000", "240");
    openingHours.add(WeekDays.Friday, "00:00", "24:00");
    openingHours.add(WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(WeekDays.Sunday, "23:59", "23:59");

    expect(openingHours.toString()).toBe(
      "mon 00:00 - 23:59\n" +
        "[tue 00:00 - 23:59]\n" +
        "wed 00:00 - 23:59\n" +
        "thu 00:00 - 23:59\n" +
        "fri 00:00 - 23:59\n" +
        "sat 00:00 - 23:59\n" +
        "sun 00:00 - 23:59"
    );
  });
  it("midnight till midnight (weekStart / it's wednesday my dudes!)", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      weekStart: WeekDays.Wednesday,
    });
    openingHours.add(WeekDays.Monday, "0:0", "0.0");
    openingHours.add(WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(WeekDays.Friday, "00:00", "24:00");
    openingHours.add(WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(WeekDays.Sunday, "23:59", "23:59");

    expect(openingHours.toString()).toBe(
      "wed 00:00 - 23:59\n" +
        "thu 00:00 - 23:59\n" +
        "fri 00:00 - 23:59\n" +
        "sat 00:00 - 23:59\n" +
        "[sun 00:00 - 23:59]\n" +
        "mon 00:00 - 23:59\n" +
        "tue 00:00 - 23:59"
    );
  });
  it("midnight till midnight (current date on top / it's wednesday my dudes!)", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDayOnTop: true,
      currentDate: new Date(2020, 8, 9),
    });
    openingHours.add(WeekDays.Monday, "0:0", "0.0");
    openingHours.add(WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(WeekDays.Friday, "00:00", "24:00");
    openingHours.add(WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(WeekDays.Sunday, "23:59", "23:59");

    expect(openingHours.toString()).toBe(
      "[wed 00:00 - 23:59]\n" +
        "thu 00:00 - 23:59\n" +
        "fri 00:00 - 23:59\n" +
        "sat 00:00 - 23:59\n" +
        "sun 00:00 - 23:59\n" +
        "mon 00:00 - 23:59\n" +
        "tue 00:00 - 23:59"
    );
  });
  it("after midnight (22:00 - 03:00)", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "2200", "0300");
    expect(openingHours.toString()).toBe(
      "mon 22:00 - 23:59\n" + "tue 00:00 - 03:00"
    );
  });

  it("overlap times", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "0000", "0100");
    openingHours.add(WeekDays.Monday, "0030", "0200");
    openingHours.add(WeekDays.Monday, "0300", "0400");
    openingHours.add(WeekDays.Monday, "0330", "0500");
    openingHours.add(WeekDays.Monday, "0700", "0800");
    openingHours.add(WeekDays.Monday, "0600", "0900");

    expect(openingHours.toString()).toBe(
      "mon 00:00 - 02:00, 03:00 - 05:00, 06:00 - 09:00"
    );
  });
});

describe('add(weekDay, "h:mm", "h:mm") - after current date', () => {
  it("toString", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "14:30");
    openingHours.add(WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30, 15:00 - 20:00");
  });

  it("toJSON", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "14:30");
    openingHours.add(WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toJSON()).toStrictEqual([
      {
        day: 1,
        from: "0830",
        until: "1430",
        text: undefined,
      },
      {
        day: 1,
        from: "1500",
        until: "2000",
        text: undefined,
      },
    ]);
  });

  it("toLocaleJSON", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "14:30");
    openingHours.add(WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toLocaleJSON()).toStrictEqual([
      {
        active: false,
        day: "mon",
        times: [
          {
            from: "08:30",
            until: "14:30",
          },
          {
            from: "15:00",
            until: "20:00",
          },
        ],
      },
    ]);
  });
});

describe('add(weekDay, "h:mm", "h:mm") - current date', () => {
  it("toString", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.add(WeekDays.Monday, "8:30", "14:30");
    openingHours.add(WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toString()).toBe("[mon 08:30 - 14:30, 15:00 - 20:00]");
  });

  it("toLocaleJSON", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.add(WeekDays.Monday, "8:30", "14:30");
    openingHours.add(WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toLocaleJSON()).toStrictEqual([
      {
        active: true,
        day: "mon",
        times: [
          {
            from: "08:30",
            until: "14:30",
          },
          {
            from: "15:00",
            until: "20:00",
          },
        ],
      },
    ]);
  });
});

describe('cut(weekDay, "h:mm", "h:mm")', () => {
  it("cut a timespan in two timespans", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(WeekDays.Monday, "1430", "1500");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30, 15:00 - 20:00");
  });
  it("cut start time", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(WeekDays.Monday, "0800", "1500");
    expect(openingHours.toString()).toBe("mon 15:00 - 20:00");
  });
  it("cut end time", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.add(WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(WeekDays.Monday, "1430", "2000");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30");
  });
  it("cut multiple", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0800", until: "1600" },
      { day: 2, from: "0800", until: "1600" },
      { day: 3, from: "0800", until: "1600" },
      { day: 4, from: "0800", until: "1600" },
      { day: 5, from: "0800", until: "1600" },
      { day: 6, from: "0800", until: "1600" },
    ]);
    expect(openingHours.toString()).toBe(
      "mon 08:00 - 16:00\n" +
        "tue 08:00 - 16:00\n" +
        "wed 08:00 - 16:00\n" +
        "thu 08:00 - 16:00\n" +
        "fri 08:00 - 16:00\n" +
        "sat 08:00 - 16:00"
    );

    openingHours.cutMulti([
      {
        days: [
          WeekDays.Monday,
          WeekDays.Tuesday,
          WeekDays.Thursday,
          WeekDays.Friday,
        ],
        from: "1230",
        until: "1300",
      },
      { day: WeekDays.Wednesday, from: "1400" },
      {
        day: WeekDays.Saturday,
        spans: [{ until: "1000" }, { from: "1400" }],
      },
    ]);

    expect(openingHours.toString()).toBe(
      "mon 08:00 - 12:30, 13:00 - 16:00\n" +
        "tue 08:00 - 12:30, 13:00 - 16:00\n" +
        "wed 08:00 - 14:00\n" +
        "thu 08:00 - 12:30, 13:00 - 16:00\n" +
        "fri 08:00 - 12:30, 13:00 - 16:00\n" +
        "sat 10:00 - 14:00"
    );
  });
});

describe("load(Array<{day, from: ISOString, until: ISOString}>) - after current date", () => {
  it("toJSON", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      {
        day: 1,
        from: "2020-09-07T06:30:00.000Z",
        until: "2020-09-07T12:30:00.000Z",
      },
      {
        day: 1,
        from: "2020-09-07T13:00:00.000Z",
        until: "2020-09-07T18:00:00.000Z",
      },
    ]);
    expect(openingHours.toJSON()).toStrictEqual([
      {
        day: 1,
        from: "0830",
        until: "1430",
        text: undefined,
      },
      {
        day: 1,
        from: "1500",
        until: "2000",
        text: undefined,
      },
    ]);
  });

  it("toLocaleJSON", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      {
        day: 1,
        from: "2020-09-07T06:30:00.000Z",
        until: "2020-09-07T12:30:00.000Z",
      },
      {
        day: 1,
        from: "2020-09-07T13:00:00.000Z",
        until: "2020-09-07T18:00:00.000Z",
      },
    ]);
    expect(openingHours.toLocaleJSON()).toStrictEqual([
      {
        active: false,
        day: "mon",
        times: [
          {
            from: "08:30",
            until: "14:30",
          },
          {
            from: "15:00",
            until: "20:00",
          },
        ],
      },
    ]);
  });

  it("toString", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      {
        day: 1,
        from: "2020-09-07T06:30:00.000Z",
        until: "2020-09-07T12:30:00.000Z",
      },
      {
        day: 1,
        from: "2020-09-07T13:00:00.000Z",
        until: "2020-09-07T18:00:00.000Z",
      },
    ]);
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30, 15:00 - 20:00");
  });
});

describe("load(Array<{day, from: ISOString, until: ISOString}>) - current date", () => {
  it("toLocaleJSON", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.load([
      { day: 1, from: "0830", until: "1430" },
      { day: 1, from: "1500", until: "2000" },
    ]);
    expect(openingHours.toLocaleJSON()).toStrictEqual([
      {
        active: true,
        day: "mon",
        times: [
          {
            from: "08:30",
            until: "14:30",
          },
          {
            from: "15:00",
            until: "20:00",
          },
        ],
      },
    ]);
  });

  it("toString", () => {
    const openingHours = new OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.load([
      {
        day: 1,
        from: "2020-09-07T06:30:00.000Z",
        until: "2020-09-07T12:30:00.000Z",
      },
      {
        day: 1,
        from: "2020-09-07T13:00:00.000Z",
        until: "2020-09-07T18:00:00.000Z",
      },
    ]);
    expect(openingHours.toString()).toBe("[mon 08:30 - 14:30, 15:00 - 20:00]");
  });
});

describe("states and utility functions", () => {
  it("checks states", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);

    expect(openingHours.getState(new Date("2020-09-07T08:29+0200"))).toBe(
      OpenState.Closed
    );
    expect(openingHours.getState(new Date("2020-09-07T08:30+0200"))).toBe(
      OpenState.Open
    );
    expect(openingHours.getState(new Date("2020-09-07T12:30+0200"))).toBe(
      OpenState.Open
    );
    expect(openingHours.getState(new Date("2020-09-07T12:31+0200"))).toBe(
      OpenState.Closed
    );
    expect(openingHours.getState(new Date("2020-09-07T12:59+0200"))).toBe(
      OpenState.Closed
    );
    expect(openingHours.getState(new Date("2020-09-07T13:00+0200"))).toBe(
      OpenState.Open
    );
    expect(openingHours.getState(new Date("2020-09-07T17:00+0200"))).toBe(
      OpenState.Open
    );
    expect(openingHours.getState(new Date("2020-09-07T17:01+0200"))).toBe(
      OpenState.Closed
    );
  });

  it("checks if open soon (default: 30min)", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(
      openingHours.isOpenSoon(new Date("2020-09-07T08:00+0200"))
    ).toBeTruthy();
    expect(openingHours.getState(new Date("2020-09-07T08:00+0200"))).toBe(
      OpenState.Closed
    );
    expect(
      openingHours.isOpenSoon(new Date("2020-09-07T12:31+0200"))
    ).toBeTruthy();
    expect(openingHours.getState(new Date("2020-09-07T12:31+0200"))).toBe(
      OpenState.Closed
    );
    // already open shouldn't trigger an open soon event
    expect(
      openingHours.isOpenSoon(new Date("2020-09-07T09:30+0200"))
    ).toBeFalsy();
  });

  it("checks if open soon (custom: 15min)", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(
      openingHours.isOpenSoon(new Date("2020-09-07T08:14+0200"), 900)
    ).toBeFalsy();
    expect(
      openingHours.isOpenSoon(new Date("2020-09-07T08:15+0200"), 900)
    ).toBeTruthy();
  });

  it("returns next open time", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.getNextOpenTime(new Date("2020-09-07T08:00"))).toBe(
      "08:30"
    );
    expect(openingHours.getNextOpenTime(new Date("2020-09-07T12:31"))).toBe(
      "13:00"
    );
    // already open, should return the next open time
    expect(openingHours.getNextOpenTime(new Date("2020-09-07T09:30"))).toBe(
      "13:00"
    );
    // closed, should return closed
    expect(openingHours.getNextOpenTime(new Date("2020-09-07T17:01"))).toBe(
      "closed"
    );
  });

  it("checks if closed soon (default: 30min)", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(
      openingHours.isClosedSoon(new Date("2020-09-07T12:01+0200"))
    ).toBeTruthy();
    expect(openingHours.getState(new Date("2020-09-07T12:00+0200"))).toBe(
      OpenState.Open
    );
    expect(
      openingHours.isClosedSoon(new Date("2020-09-07T16:59+0200"))
    ).toBeTruthy();
    expect(openingHours.getState(new Date("2020-09-07T16:59+0200"))).toBe(
      OpenState.Open
    );
    // already closed shouldn't trigger an closed soon event
    expect(
      openingHours.isClosedSoon(new Date("2020-09-07T17:30+0200"))
    ).toBeFalsy();
  });

  it("checks if closed soon (custom: 15min)", () => {
    const openingHours = new OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(
      openingHours.isClosedSoon(new Date("2020-09-07T16:30+0200"), 900)
    ).toBeFalsy();
    expect(
      openingHours.isClosedSoon(new Date("2020-09-07T16:46+0200"), 900)
    ).toBeTruthy();
  });
});

describe("TimeZone/DST Check: Berlin: Mar 27, +01:00", () => {
  let currentDate: string;
  let openingHours: OpeningHours;

  beforeEach(() => {
    currentDate = "2021-03-27T10:30:00+0100";
    openingHours = new OpeningHours({
      currentDate: new Date(currentDate),
      locales: "de-DE",
      dateTimeFormatOptions: {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(WeekDays.Saturday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sat 10:30 - 12:30]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Berlin: Mar 28, +02:00", () => {
  let currentDate: string;
  let openingHours: OpeningHours;

  beforeEach(() => {
    currentDate = "2021-03-28T10:30:00+0200";
    openingHours = new OpeningHours({
      currentDate: new Date(currentDate),
      locales: "de-DE",
      dateTimeFormatOptions: {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(WeekDays.Sunday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sun 10:30 - 12:30]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Melbourne: Apr 3, +11:00", () => {
  let currentDate: string;
  let openingHours: OpeningHours;

  beforeEach(() => {
    currentDate = "2021-04-03T10:30:00+1100";
    openingHours = new OpeningHours({
      currentDate: new Date(currentDate),
      locales: "en-AU",
      dateTimeFormatOptions: {
        timeZone: "Australia/Melbourne",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(WeekDays.Saturday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sat 10:30 am - 12:30 pm]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date("2021-04-03T10:29:00+1100");
    expect(openingHours.getState(beforeFrom)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date("2021-04-03T11:30:00+1100");
    expect(openingHours.getState(openTime)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date("2021-04-03T12:29:00+1100");
    expect(openingHours.getState(beforeUntil)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Melbourne: Apr 4, +10:00", () => {
  let currentDate: string;
  let openingHours: OpeningHours;

  beforeEach(() => {
    currentDate = "2021-04-04T10:30:00+1000";
    openingHours = new OpeningHours({
      currentDate: new Date(currentDate),
      locales: "en-AU",
      dateTimeFormatOptions: {
        timeZone: "Australia/Melbourne",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(WeekDays.Sunday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sun 10:30 am - 12:30 pm]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});
