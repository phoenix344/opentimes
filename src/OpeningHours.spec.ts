import {
  assert,
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { OpeningHoursOptions } from "./interfaces.ts";
import { OpeningHours } from "./OpeningHours.ts";
import { WeekDays } from "./WeekDays.ts";
import { OpenState } from "./OpenState.ts";

const defaultOptions: Partial<OpeningHoursOptions> = {
  currentDate: new Date("2020-09-06T00:00:00+0200"),
  currentDayOnTop: false,
  locales: "de-DE",
  dateTimeFormatOptions: {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  },
};

Deno.test("options test: midnight till midnight (00:00 - 00:00)", () => {
  const openingHours = new OpeningHours(defaultOptions);

  // fuzzy matching test for midnight
  openingHours.add(WeekDays.Monday, "0:0", "0.0");
  openingHours.add(WeekDays.Tuesday, "00:00", "00:00");
  openingHours.add(WeekDays.Wednesday, "24:00", "00:00");
  openingHours.add(WeekDays.Thursday, "23:59", "00:00");
  openingHours.add(WeekDays.Friday, "00:00", "24:00");
  openingHours.add(WeekDays.Saturday, "00:00", "23:59");
  openingHours.add(WeekDays.Sunday, "23:59", "23:59");

  assertEquals(
    openingHours.toString(),
    "mon 00:00 - 23:59\n" +
      "tue 00:00 - 23:59\n" +
      "wed 00:00 - 23:59\n" +
      "thu 00:00 - 23:59\n" +
      "fri 00:00 - 23:59\n" +
      "sat 00:00 - 23:59\n" +
      "[sun 00:00 - 23:59]",
  );
});
Deno.test("options test: midnight till midnight (current date is tuesday)", () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDate: new Date("2020-09-08"),
  });

  // fuzzy matching test for midnight
  openingHours.add(WeekDays.Monday, "0000", "0000");
  openingHours.add(WeekDays.Tuesday, "2359", "2400");
  openingHours.add(WeekDays.Wednesday, "24-00", "00/00");
  openingHours.add(WeekDays.Thursday, "000", "240");
  openingHours.add(WeekDays.Friday, "00:00", "24:00");
  openingHours.add(WeekDays.Saturday, "00:00", "23:59");
  openingHours.add(WeekDays.Sunday, "23:59", "23:59");

  assertEquals(
    openingHours.toString(),
    "mon 00:00 - 23:59\n" +
      "[tue 00:00 - 23:59]\n" +
      "wed 00:00 - 23:59\n" +
      "thu 00:00 - 23:59\n" +
      "fri 00:00 - 23:59\n" +
      "sat 00:00 - 23:59\n" +
      "sun 00:00 - 23:59",
  );
});
Deno.test("options test: midnight till midnight (weekStart / it's wednesday my dudes!)", () => {
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

  assertEquals(
    openingHours.toString(),
    "wed 00:00 - 23:59\n" +
      "thu 00:00 - 23:59\n" +
      "fri 00:00 - 23:59\n" +
      "sat 00:00 - 23:59\n" +
      "[sun 00:00 - 23:59]\n" +
      "mon 00:00 - 23:59\n" +
      "tue 00:00 - 23:59",
  );
});
Deno.test("options test: midnight till midnight (current date on top / it's wednesday my dudes!)", () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDayOnTop: true,
    currentDate: new Date("2020-09-09"),
  });
  openingHours.add(WeekDays.Monday, "0:0", "0.0");
  openingHours.add(WeekDays.Tuesday, "00:00", "00:00");
  openingHours.add(WeekDays.Wednesday, "24:00", "00:00");
  openingHours.add(WeekDays.Thursday, "23:59", "00:00");
  openingHours.add(WeekDays.Friday, "00:00", "24:00");
  openingHours.add(WeekDays.Saturday, "00:00", "23:59");
  openingHours.add(WeekDays.Sunday, "23:59", "23:59");

  assertEquals(
    openingHours.toString(),
    "[wed 00:00 - 23:59]\n" +
      "thu 00:00 - 23:59\n" +
      "fri 00:00 - 23:59\n" +
      "sat 00:00 - 23:59\n" +
      "sun 00:00 - 23:59\n" +
      "mon 00:00 - 23:59\n" +
      "tue 00:00 - 23:59",
  );
});
Deno.test("options test: after midnight (22:00 - 03:00)", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "2200", "0300");
  assertEquals(
    openingHours.toString(),
    "mon 22:00 - 23:59\n" + "tue 00:00 - 03:00",
  );
});

Deno.test("options test: overlap times", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "0000", "0100");
  openingHours.add(WeekDays.Monday, "0030", "0200");
  openingHours.add(WeekDays.Monday, "0300", "0400");
  openingHours.add(WeekDays.Monday, "0330", "0500");
  openingHours.add(WeekDays.Monday, "0700", "0800");
  openingHours.add(WeekDays.Monday, "0600", "0900");

  assertEquals(
    openingHours.toString(),
    "mon 00:00 - 02:00, 03:00 - 05:00, 06:00 - 09:00",
  );
});

Deno.test('add(weekDay, "h:mm", "h:mm") - after current date: toString', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "14:30");
  openingHours.add(WeekDays.Monday, "15:00", "20:00");
  assertEquals(openingHours.toString(), "mon 08:30 - 14:30, 15:00 - 20:00");
});

Deno.test('add(weekDay, "h:mm", "h:mm") - after current date: toJSON', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "14:30");
  openingHours.add(WeekDays.Monday, "15:00", "20:00");
  assertEquals(openingHours.toJSON(), [
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

Deno.test('add(weekDay, "h:mm", "h:mm") - after current date: toLocaleJSON', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "14:30");
  openingHours.add(WeekDays.Monday, "15:00", "20:00");
  assertEquals(openingHours.toLocaleJSON(), [
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

Deno.test('add(weekDay, "h:mm", "h:mm") - current date: toString', () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDate: new Date("2020-09-07"),
  });
  openingHours.add(WeekDays.Monday, "8:30", "14:30");
  openingHours.add(WeekDays.Monday, "15:00", "20:00");
  assertEquals(openingHours.toString(), "[mon 08:30 - 14:30, 15:00 - 20:00]");
});

Deno.test('add(weekDay, "h:mm", "h:mm") - current date: toLocaleJSON', () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDate: new Date("2020-09-07"),
  });
  openingHours.add(WeekDays.Monday, "8:30", "14:30");
  openingHours.add(WeekDays.Monday, "15:00", "20:00");
  assertEquals(openingHours.toLocaleJSON(), [
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

Deno.test('cut(weekDay, "h:mm", "h:mm"): cut a timespan in two timespans', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "20:00");
  assertEquals(openingHours.toString(), "mon 08:30 - 20:00");
  openingHours.cut(WeekDays.Monday, "1430", "1500");
  assertEquals(openingHours.toString(), "mon 08:30 - 14:30, 15:00 - 20:00");
});
Deno.test('cut(weekDay, "h:mm", "h:mm"): cut start time', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "20:00");
  assertEquals(openingHours.toString(), "mon 08:30 - 20:00");
  openingHours.cut(WeekDays.Monday, "0800", "1500");
  assertEquals(openingHours.toString(), "mon 15:00 - 20:00");
});
Deno.test('cut(weekDay, "h:mm", "h:mm"): cut end time', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.add(WeekDays.Monday, "8:30", "20:00");
  assertEquals(openingHours.toString(), "mon 08:30 - 20:00");
  openingHours.cut(WeekDays.Monday, "1430", "2000");
  assertEquals(openingHours.toString(), "mon 08:30 - 14:30");
});
Deno.test('cut(weekDay, "h:mm", "h:mm"): cut multiple', () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0800", until: "1600" },
    { day: 2, from: "0800", until: "1600" },
    { day: 3, from: "0800", until: "1600" },
    { day: 4, from: "0800", until: "1600" },
    { day: 5, from: "0800", until: "1600" },
    { day: 6, from: "0800", until: "1600" },
  ]);
  assertEquals(
    openingHours.toString(),
    "mon 08:00 - 16:00\n" +
      "tue 08:00 - 16:00\n" +
      "wed 08:00 - 16:00\n" +
      "thu 08:00 - 16:00\n" +
      "fri 08:00 - 16:00\n" +
      "sat 08:00 - 16:00",
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

  assertEquals(
    openingHours.toString(),
    "mon 08:00 - 12:30, 13:00 - 16:00\n" +
      "tue 08:00 - 12:30, 13:00 - 16:00\n" +
      "wed 08:00 - 14:00\n" +
      "thu 08:00 - 12:30, 13:00 - 16:00\n" +
      "fri 08:00 - 12:30, 13:00 - 16:00\n" +
      "sat 10:00 - 14:00",
  );
});

Deno.test("fromJSON(Array<{day, from: ISOString, until: ISOString}>) - after current date: toJSON", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    {
      day: 1,
      from: "2020-09-07T08:30:00",
      until: "2020-09-07T14:30:00",
    },
    {
      day: 1,
      from: "2020-09-07T15:00:00",
      until: "2020-09-07T20:00:00",
    },
  ]);
  assertEquals(openingHours.toJSON(), [
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

Deno.test("fromJSON(Array<{day, from: ISOString, until: ISOString}>) - after current date: toLocaleJSON", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    {
      day: 1,
      from: "2020-09-07T08:30:00",
      until: "2020-09-07T14:30:00",
    },
    {
      day: 1,
      from: "2020-09-07T15:00:00",
      until: "2020-09-07T20:00:00",
    },
  ]);
  assertEquals(openingHours.toLocaleJSON(), [
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

Deno.test("fromJSON(Array<{day, from: ISOString, until: ISOString}>) - after current date: toString", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    {
      day: 1,
      from: "2020-09-07T08:30:00",
      until: "2020-09-07T14:30:00",
    },
    {
      day: 1,
      from: "2020-09-07T15:00:00",
      until: "2020-09-07T20:00:00",
    },
  ]);
  assertEquals(openingHours.toString(), "mon 08:30 - 14:30, 15:00 - 20:00");
});

Deno.test("fromJSON(Array<{day, from: ISOString, until: ISOString}>) - current date: toLocaleJSON", () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDate: new Date("2020-09-07"),
  });
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1430" },
    { day: 1, from: "1500", until: "2000" },
  ]);
  assertEquals(openingHours.toLocaleJSON(), [
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

Deno.test("fromJSON(Array<{day, from: ISOString, until: ISOString}>) - current date: toString", () => {
  const openingHours = new OpeningHours({
    ...defaultOptions,
    currentDate: new Date("2020-09-07"),
  });
  openingHours.fromJSON([
    {
      day: 1,
      from: "2020-09-07T08:30:00",
      until: "2020-09-07T14:30:00",
    },
    {
      day: 1,
      from: "2020-09-07T15:00:00",
      until: "2020-09-07T20:00:00",
    },
  ]);
  assertEquals(openingHours.toString(), "[mon 08:30 - 14:30, 15:00 - 20:00]");
});

Deno.test("states and utility functions: checks states", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);

  assertEquals(
    openingHours.getState(new Date("2020-09-07T08:29+0200")),
    OpenState.Closed,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T08:30+0200")),
    OpenState.Open,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T12:30+0200")),
    OpenState.Open,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T12:31+0200")),
    OpenState.Closed,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T12:59+0200")),
    OpenState.Closed,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T13:00+0200")),
    OpenState.Open,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T17:00+0200")),
    OpenState.Open,
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T17:01+0200")),
    OpenState.Closed,
  );
});

Deno.test("states and utility functions: checks if open soon (default: 30min)", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);

  assert(
    openingHours.isOpenSoon(new Date("2020-09-07T08:00+0200")),
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T08:00+0200")),
    OpenState.Closed,
  );
  assert(
    openingHours.isOpenSoon(new Date("2020-09-07T12:31+0200")),
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T12:31+0200")),
    OpenState.Closed,
  );
  // already open shouldn't trigger an open soon event
  assertFalse(
    openingHours.isOpenSoon(new Date("2020-09-07T09:30+0200")),
  );
});

Deno.test("states and utility functions: checks if open soon (custom: 15min)", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);
  assertFalse(
    openingHours.isOpenSoon(new Date("2020-09-07T08:14+0200"), 900),
  );
  assert(
    openingHours.isOpenSoon(new Date("2020-09-07T08:15+0200"), 900),
  );
});

Deno.test("states and utility functions: returns next open time", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);
  assertEquals(
    openingHours.getNextOpenTime(new Date("2020-09-07T08:00+0200")),
    "08:30",
  );
  assertEquals(
    openingHours.getNextOpenTime(new Date("2020-09-07T12:31+0200")),
    "13:00",
  );
  // already open, should return it's open
  assertEquals(
    openingHours.getNextOpenTime(new Date("2020-09-07T09:30+0200")),
    "open",
  );
  // closed, should return closed
  assertEquals(
    openingHours.getNextOpenTime(new Date("2020-09-07T17:01+0200")),
    "closed",
  );
});

Deno.test("states and utility functions: checks if closed soon (default: 30min)", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);
  assert(
    openingHours.isClosedSoon(new Date("2020-09-07T12:01+0200")),
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T12:00+0200")),
    OpenState.Open,
  );
  assert(
    openingHours.isClosedSoon(new Date("2020-09-07T16:59+0200")),
  );
  assertEquals(
    openingHours.getState(new Date("2020-09-07T16:59+0200")),
    OpenState.Open,
  );
  // already closed shouldn't trigger an closed soon event
  assertFalse(
    openingHours.isClosedSoon(new Date("2020-09-07T17:30+0200")),
  );
});

Deno.test("states and utility functions: checks if closed soon (custom: 15min)", () => {
  const openingHours = new OpeningHours(defaultOptions);
  openingHours.fromJSON([
    { day: 1, from: "0830", until: "1230" },
    { day: 1, from: "1300", until: "1700" },
  ]);
  assertFalse(
    openingHours.isClosedSoon(new Date("2020-09-07T16:30+0200"), 900),
  );
  assert(
    openingHours.isClosedSoon(new Date("2020-09-07T16:46+0200"), 900),
  );
});

let currentDate: string;
let openingHours: OpeningHours;
function beforeTZCheck() {
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
}

Deno.test("TimeZone/DST Check: Berlin: Mar 27, +01:00: current day is active", () => {
  beforeTZCheck();
  const beforeFrom = new Date(currentDate);
  beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
  assertEquals(openingHours.toString(), "[sat 10:30 - 12:30]");
});

Deno.test("TimeZone/DST Check: Berlin: Mar 27, +01:00: getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
  beforeTZCheck();
  const beforeFrom = new Date(currentDate);
  beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

  assertEquals(openingHours.getState(beforeFrom), OpenState.Closed);
  assert(openingHours.isOpenSoon(beforeFrom));
  assertFalse(openingHours.isClosedSoon(beforeFrom));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 27, +01:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck();
  const openTime = new Date(currentDate);
  openTime.setMinutes(openTime.getMinutes() + 60);

  assertEquals(openingHours.getState(openTime), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(openTime));
  assertFalse(openingHours.isClosedSoon(openTime));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 27, +01:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
  beforeTZCheck();
  const beforeUntil = new Date(currentDate);
  beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

  assertEquals(openingHours.getState(beforeUntil), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(beforeUntil));
  assert(openingHours.isClosedSoon(beforeUntil));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 27, +01:00: getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck();
  const afterUntil = new Date(currentDate);
  afterUntil.setMinutes(afterUntil.getMinutes() + 121);

  assertEquals(openingHours.getState(afterUntil), OpenState.Closed);
  assertFalse(openingHours.isOpenSoon(afterUntil));
  assertFalse(openingHours.isClosedSoon(afterUntil));
});

function beforeTZCheck2() {
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
}

Deno.test("TimeZone/DST Check: Berlin: Mar 28, +02:00: current day is active", () => {
  beforeTZCheck2();
  assertEquals(openingHours.toString(), "[sun 10:30 - 12:30]");
});

Deno.test("TimeZone/DST Check: Berlin: Mar 28, +02:00: getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
  beforeTZCheck2();
  const beforeFrom = new Date(currentDate);
  beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

  assertEquals(openingHours.getState(beforeFrom), OpenState.Closed);
  assert(openingHours.isOpenSoon(beforeFrom));
  assertFalse(openingHours.isClosedSoon(beforeFrom));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 28, +02:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck2();
  const openTime = new Date(currentDate);
  openTime.setMinutes(openTime.getMinutes() + 60);

  assertEquals(openingHours.getState(openTime), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(openTime));
  assertFalse(openingHours.isClosedSoon(openTime));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 28, +02:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
  beforeTZCheck2();
  const beforeUntil = new Date(currentDate);
  beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

  assertEquals(openingHours.getState(beforeUntil), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(beforeUntil));
  assert(openingHours.isClosedSoon(beforeUntil));
});

Deno.test("TimeZone/DST Check: Berlin: Mar 28, +02:00: getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck2();
  const afterUntil = new Date(currentDate);
  afterUntil.setMinutes(afterUntil.getMinutes() + 121);

  assertEquals(openingHours.getState(afterUntil), OpenState.Closed);
  assertFalse(openingHours.isOpenSoon(afterUntil));
  assertFalse(openingHours.isClosedSoon(afterUntil));
});

function beforeTZCheck3() {
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
}

Deno.test("TimeZone/DST Check: Melbourne: Apr 3, +11:00: current day is active", () => {
  beforeTZCheck3();
  assertEquals(openingHours.toString(), "[sat 10:30 am - 12:30 pm]");
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 3, +11:00: getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
  beforeTZCheck3();
  const beforeFrom = new Date("2021-04-03T10:29:00+1100");
  assertEquals(openingHours.getState(beforeFrom), OpenState.Closed);
  assert(openingHours.isOpenSoon(beforeFrom));
  assertFalse(openingHours.isClosedSoon(beforeFrom));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 3, +11:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck3();
  const openTime = new Date("2021-04-03T11:30:00+1100");
  assertEquals(openingHours.getState(openTime), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(openTime));
  assertFalse(openingHours.isClosedSoon(openTime));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 3, +11:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
  beforeTZCheck3();
  const beforeUntil = new Date("2021-04-03T12:29:00+1100");
  assertEquals(openingHours.getState(beforeUntil), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(beforeUntil));
  assert(openingHours.isClosedSoon(beforeUntil));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 3, +11:00: getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck3();
  const afterUntil = new Date(currentDate);
  afterUntil.setMinutes(afterUntil.getMinutes() + 181);

  assertEquals(openingHours.getState(afterUntil), OpenState.Closed);
  assertFalse(openingHours.isOpenSoon(afterUntil));
  assertFalse(openingHours.isClosedSoon(afterUntil));
});

function beforeTZCheck4() {
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
}

Deno.test("TimeZone/DST Check: Melbourne: Apr 4, +10:00: current day is active", () => {
  beforeTZCheck4();
  const beforeFrom = new Date(currentDate);
  beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);
  assertEquals(openingHours.toString(), "[sun 10:30 am - 12:30 pm]");
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 4, +10:00: getState() = Closed, isOpenSoon() = true, isClosedSoon() = false", () => {
  beforeTZCheck4();
  const beforeFrom = new Date(currentDate);
  beforeFrom.setMinutes(beforeFrom.getMinutes() - 1);

  assertEquals(openingHours.getState(beforeFrom), OpenState.Closed);
  assert(openingHours.isOpenSoon(beforeFrom));
  assertFalse(openingHours.isClosedSoon(beforeFrom));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 4, +10:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck4();
  const openTime = new Date(currentDate);
  openTime.setMinutes(openTime.getMinutes() + 60);

  assertEquals(openingHours.getState(openTime), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(openTime));
  assertFalse(openingHours.isClosedSoon(openTime));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 4, +10:00: getState() = Open, isOpenSoon() = false, isClosedSoon() = true", () => {
  beforeTZCheck4();
  const beforeUntil = new Date(currentDate);
  beforeUntil.setMinutes(beforeUntil.getMinutes() + 119);

  assertEquals(openingHours.getState(beforeUntil), OpenState.Open);
  assertFalse(openingHours.isOpenSoon(beforeUntil));
  assert(openingHours.isClosedSoon(beforeUntil));
});

Deno.test("TimeZone/DST Check: Melbourne: Apr 4, +10:00: getState() = Closed, isOpenSoon() = false, isClosedSoon() = false", () => {
  beforeTZCheck4();
  const afterUntil = new Date(currentDate);
  afterUntil.setMinutes(afterUntil.getMinutes() + 121);

  assertEquals(openingHours.getState(afterUntil), OpenState.Closed);
  assertFalse(openingHours.isOpenSoon(afterUntil));
  assertFalse(openingHours.isClosedSoon(afterUntil));
});

function beforeTZCheck5() {
  currentDate = "2022-01-30T10:30:00+1000";
  openingHours = new OpeningHours({
    currentDate: new Date(currentDate),
    locales: "de-DE",
    weekStart: WeekDays.Sunday,
    dateTimeFormatOptions: {
      timeZone: "Australia/Melbourne",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    },
  });
  openingHours.add(WeekDays.Sunday, "10:30", "12:30");
}

Deno.test("TimeZone/DST Check: Melbourne: Dec 5, +10:00: tests overlapping times on current day", () => {
  beforeTZCheck5();
  openingHours.add(WeekDays.Monday, "1000", "1600");
  openingHours.add(WeekDays.Monday, "2200", "0300");
  openingHours.add(WeekDays.Tuesday, "1000", "1600");
  openingHours.add(WeekDays.Tuesday, "2200", "0300");
  openingHours.add(WeekDays.Wednesday, "1000", "1600");
  openingHours.add(WeekDays.Wednesday, "2200", "0300");
  openingHours.add(WeekDays.Thursday, "1000", "1600");
  openingHours.add(WeekDays.Thursday, "2200", "0300");
  openingHours.add(WeekDays.Friday, "1000", "1600");
  openingHours.add(WeekDays.Friday, "2200", "0300");
  openingHours.add(WeekDays.Saturday, "1000", "1600");
  openingHours.add(WeekDays.Saturday, "1700", "0200");
  openingHours.add(WeekDays.Sunday, "1000", "1600");
  openingHours.add(WeekDays.Sunday, "1700", "0200");
  assertEquals(
    openingHours.toString(),
    "[sun 00:00 - 02:00, 10:00 - 16:00, 17:00 - 23:59]\n" +
      "mon 00:00 - 02:00, 10:00 - 16:00, 22:00 - 23:59\n" +
      "tue 00:00 - 03:00, 10:00 - 16:00, 22:00 - 23:59\n" +
      "wed 00:00 - 03:00, 10:00 - 16:00, 22:00 - 23:59\n" +
      "thu 00:00 - 03:00, 10:00 - 16:00, 22:00 - 23:59\n" +
      "fri 00:00 - 03:00, 10:00 - 16:00, 22:00 - 23:59\n" +
      "sat 00:00 - 03:00, 10:00 - 16:00, 17:00 - 23:59",
  );
});
