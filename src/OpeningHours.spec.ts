import * as oh from "./OpeningHours";

const defaultOptions: oh.OpeningHoursOptions = {
  currentDate: new Date(2020, 8, 6),
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
    const openingHours = new oh.OpeningHours(defaultOptions);

    // fuzzy matching test for midnight
    openingHours.add(oh.WeekDays.Monday, "0:0", "0.0");
    openingHours.add(oh.WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(oh.WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(oh.WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(oh.WeekDays.Friday, "00:00", "24:00");
    openingHours.add(oh.WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(oh.WeekDays.Sunday, "23:59", "23:59");

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
    const openingHours = new oh.OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 8),
    });

    // fuzzy matching test for midnight
    openingHours.add(oh.WeekDays.Monday, "0000", "0000");
    openingHours.add(oh.WeekDays.Tuesday, "2359", "2400");
    openingHours.add(oh.WeekDays.Wednesday, "24-00", "00/00");
    openingHours.add(oh.WeekDays.Thursday, "000", "240");
    openingHours.add(oh.WeekDays.Friday, "00:00", "24:00");
    openingHours.add(oh.WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(oh.WeekDays.Sunday, "23:59", "23:59");

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
    const openingHours = new oh.OpeningHours({
      ...defaultOptions,
      weekStart: oh.WeekDays.Wednesday,
    });
    openingHours.add(oh.WeekDays.Monday, "0:0", "0.0");
    openingHours.add(oh.WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(oh.WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(oh.WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(oh.WeekDays.Friday, "00:00", "24:00");
    openingHours.add(oh.WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(oh.WeekDays.Sunday, "23:59", "23:59");

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
    const openingHours = new oh.OpeningHours({
      ...defaultOptions,
      currentDayOnTop: true,
      currentDate: new Date(2020, 8, 9),
    });
    openingHours.add(oh.WeekDays.Monday, "0:0", "0.0");
    openingHours.add(oh.WeekDays.Tuesday, "00:00", "00:00");
    openingHours.add(oh.WeekDays.Wednesday, "24:00", "00:00");
    openingHours.add(oh.WeekDays.Thursday, "23:59", "00:00");
    openingHours.add(oh.WeekDays.Friday, "00:00", "24:00");
    openingHours.add(oh.WeekDays.Saturday, "00:00", "23:59");
    openingHours.add(oh.WeekDays.Sunday, "23:59", "23:59");

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
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "2200", "0300");
    expect(openingHours.toString()).toBe(
      "mon 22:00 - 23:59\n" + "tue 00:00 - 03:00"
    );
  });

  it("overlap times", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "0000", "0100");
    openingHours.add(oh.WeekDays.Monday, "0030", "0200");
    openingHours.add(oh.WeekDays.Monday, "0300", "0400");
    openingHours.add(oh.WeekDays.Monday, "0330", "0500");
    openingHours.add(oh.WeekDays.Monday, "0700", "0800");
    openingHours.add(oh.WeekDays.Monday, "0600", "0900");

    expect(openingHours.toString()).toBe(
      "mon 00:00 - 02:00, 03:00 - 05:00, 06:00 - 09:00"
    );
  });
});

describe('add(weekDay, "h:mm", "h:mm") - after current date', () => {
  it("toString", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "14:30");
    openingHours.add(oh.WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30, 15:00 - 20:00");
  });

  it("toJSON", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "14:30");
    openingHours.add(oh.WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toJSON()).toStrictEqual([
      {
        day: 1,
        from: "0830",
        until: "1430",
      },
      {
        day: 1,
        from: "1500",
        until: "2000",
      },
    ]);
  });

  it("toLocaleJSON", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "14:30");
    openingHours.add(oh.WeekDays.Monday, "15:00", "20:00");
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
    const openingHours = new oh.OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.add(oh.WeekDays.Monday, "8:30", "14:30");
    openingHours.add(oh.WeekDays.Monday, "15:00", "20:00");
    expect(openingHours.toString()).toBe("[mon 08:30 - 14:30, 15:00 - 20:00]");
  });

  it("toLocaleJSON", () => {
    const openingHours = new oh.OpeningHours({
      ...defaultOptions,
      currentDate: new Date(2020, 8, 7),
    });
    openingHours.add(oh.WeekDays.Monday, "8:30", "14:30");
    openingHours.add(oh.WeekDays.Monday, "15:00", "20:00");
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
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(oh.WeekDays.Monday, "1430", "1500");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30, 15:00 - 20:00");
  });
  it("cut start time", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(oh.WeekDays.Monday, "0800", "1500");
    expect(openingHours.toString()).toBe("mon 15:00 - 20:00");
  });
  it("cut end time", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.add(oh.WeekDays.Monday, "8:30", "20:00");
    expect(openingHours.toString()).toBe("mon 08:30 - 20:00");
    openingHours.cut(oh.WeekDays.Monday, "1430", "2000");
    expect(openingHours.toString()).toBe("mon 08:30 - 14:30");
  });
  it("cut multiple", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
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
          oh.WeekDays.Monday,
          oh.WeekDays.Tuesday,
          oh.WeekDays.Thursday,
          oh.WeekDays.Friday,
        ],
        from: "1230",
        until: "1300",
      },
      { day: oh.WeekDays.Wednesday, from: "1400" },
      {
        day: oh.WeekDays.Saturday,
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
  it("toString", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
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

  it("toJSON", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
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
      },
      {
        day: 1,
        from: "1500",
        until: "2000",
      },
    ]);
  });

  it("toLocaleJSON", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
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
});

describe("load(Array<{day, from: ISOString, until: ISOString}>) - current date", () => {
  it("toString", () => {
    const openingHours = new oh.OpeningHours({
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

  it("toLocaleJSON", () => {
    const openingHours = new oh.OpeningHours({
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
});

describe("states and utility functions", () => {
  it("checks states", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.getState(new Date(2020, 8, 7, 8, 29))).toBe(
      oh.OpenState.Closed
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 8, 30))).toBe(
      oh.OpenState.Open
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 12, 30))).toBe(
      oh.OpenState.Open
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 12, 31))).toBe(
      oh.OpenState.Closed
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 12, 59))).toBe(
      oh.OpenState.Closed
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 13, 0))).toBe(
      oh.OpenState.Open
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 17, 0))).toBe(
      oh.OpenState.Open
    );
    expect(openingHours.getState(new Date(2020, 8, 7, 17, 1))).toBe(
      oh.OpenState.Closed
    );
  });

  it("checks if open soon (default: 30min)", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.isOpenSoon(new Date(2020, 8, 7, 8))).toBeTruthy();
    expect(openingHours.getState(new Date(2020, 8, 7, 8))).toBe(
      oh.OpenState.Closed
    );
    expect(openingHours.isOpenSoon(new Date(2020, 8, 7, 12, 31))).toBeTruthy();
    expect(openingHours.getState(new Date(2020, 8, 7, 8))).toBe(
      oh.OpenState.Closed
    );
    // already open shouldn't trigger an open soon event
    expect(openingHours.isOpenSoon(new Date(2020, 8, 7, 9, 30))).toBeFalsy();
  });

  it("checks if open soon (custom: 15min)", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.isOpenSoon(new Date(2020, 8, 7, 8), 900)).toBeFalsy();
    expect(
      openingHours.isOpenSoon(new Date(2020, 8, 7, 8, 15), 900)
    ).toBeTruthy();
  });

  it("returns next open time", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.getNextOpenTime(new Date(2020, 8, 7, 8))).toBe("08:30");
    expect(openingHours.getNextOpenTime(new Date(2020, 8, 7, 12, 31))).toBe(
      "13:00"
    );
    // already open, should return the next open time
    expect(openingHours.getNextOpenTime(new Date(2020, 8, 7, 9, 30))).toBe(
      "13:00"
    );
    // closed, should return closed
    expect(openingHours.getNextOpenTime(new Date(2020, 8, 7, 17, 1))).toBe(
      "closed"
    );
  });

  it("checks if closed soon (default: 30min)", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(openingHours.isClosedSoon(new Date(2020, 8, 7, 12, 1))).toBeTruthy();
    expect(openingHours.getState(new Date(2020, 8, 7, 12))).toBe(
      oh.OpenState.Open
    );
    expect(
      openingHours.isClosedSoon(new Date(2020, 8, 7, 16, 59))
    ).toBeTruthy();
    expect(openingHours.getState(new Date(2020, 8, 7, 16, 59))).toBe(
      oh.OpenState.Open
    );
    // already closed shouldn't trigger an closed soon event
    expect(openingHours.isClosedSoon(new Date(2020, 8, 7, 17, 30))).toBeFalsy();
  });

  it("checks if closed soon (custom: 15min)", () => {
    const openingHours = new oh.OpeningHours(defaultOptions);
    openingHours.load([
      { day: 1, from: "0830", until: "1230" },
      { day: 1, from: "1300", until: "1700" },
    ]);
    expect(
      openingHours.isClosedSoon(new Date(2020, 8, 7, 16, 30), 900)
    ).toBeFalsy();
    expect(
      openingHours.isClosedSoon(new Date(2020, 8, 7, 16, 46), 900)
    ).toBeTruthy();
  });
});

describe("TimeZone/DST Check: Berlin: Mar 27, +01:00", () => {
  let currentDate: string;
  let openingHours: oh.OpeningHours;

  beforeEach(() => {
    currentDate = "2021-03-27T10:30:00+0100";
    openingHours = new oh.OpeningHours({
      currentDate: new Date(currentDate),
      locales: "de-DE",
      dateTimeFormatOptions: {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(oh.WeekDays.Saturday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sat 10:30 - 12:30]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Berlin: Mar 28, +02:00", () => {
  let currentDate: string;
  let openingHours: oh.OpeningHours;

  beforeEach(() => {
    currentDate = "2021-03-28T10:30:00+0200";
    openingHours = new oh.OpeningHours({
      currentDate: new Date(currentDate),
      locales: "de-DE",
      dateTimeFormatOptions: {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(oh.WeekDays.Sunday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sun 10:30 - 12:30]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Melbourne: Apr 3, +11:00", () => {
  let currentDate: string;
  let openingHours: oh.OpeningHours;

  beforeEach(() => {
    currentDate = "2021-04-03T10:30:00+1100";
    openingHours = new oh.OpeningHours({
      currentDate: new Date(currentDate),
      locales: "en-AU",
      dateTimeFormatOptions: {
        timeZone: "Australia/Melbourne",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(oh.WeekDays.Saturday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sat 10:30 am - 12:30 pm]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});

describe("TimeZone/DST Check: Melbourne: Apr 4, +10:00", () => {
  let currentDate: string;
  let openingHours: oh.OpeningHours;

  beforeEach(() => {
    currentDate = "2021-04-04T10:30:00+1000";
    openingHours = new oh.OpeningHours({
      currentDate: new Date(currentDate),
      locales: "en-AU",
      dateTimeFormatOptions: {
        timeZone: "Australia/Melbourne",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      },
    });
    openingHours.add(oh.WeekDays.Sunday, "10:30", "12:30");
  });

  it("current day is active", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
    expect(openingHours.toString()).toBe("[sun 10:30 am - 12:30 pm]");
  });

  it("getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
    const beforeFrom = new Date(currentDate);
    beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

    expect(openingHours.getState(beforeFrom)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(beforeFrom)).toBeTruthy();
    expect(openingHours.isClosedSoon(beforeFrom)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
    const openTime = new Date(currentDate);
    openTime.setMinutes(openTime.getMinutes() + 60);

    expect(openingHours.getState(openTime)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(openTime)).toBeFalsy();
    expect(openingHours.isClosedSoon(openTime)).toBeFalsy();
  });

  it("getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
    const beforeUntil = new Date(currentDate);
    beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

    expect(openingHours.getState(beforeUntil)).toBe(oh.OpenState.Open);
    expect(openingHours.isOpenSoon(beforeUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(beforeUntil)).toBeTruthy();
  });

  it("getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
    const afterUntil = new Date(currentDate);
    afterUntil.setMinutes(afterUntil.getMinutes() + 121);

    expect(openingHours.getState(afterUntil)).toBe(oh.OpenState.Closed);
    expect(openingHours.isOpenSoon(afterUntil)).toBeFalsy();
    expect(openingHours.isClosedSoon(afterUntil)).toBeFalsy();
  });
});
