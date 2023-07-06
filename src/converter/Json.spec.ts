import {
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { OpeningHoursOptions } from "../interfaces.ts";
import { WeekDays, WeekDaysShort } from "../WeekDays.ts";
import { Json } from "./Json.ts";

const defaultOptions: OpeningHoursOptions = {
  weekStart: WeekDays.Monday,
  currentDate: new Date("2021-09-29T12:00:00"),
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

Deno.test("Json::toData(input, options?)", () => {
  const converter = new Json();
  const [monday, tuesdayMorning, tuesdayAfternoon] = converter.toData(
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
    defaultOptions,
  );

  assertEquals(monday.day, WeekDays.Monday);
  assertEquals(monday.from, "0800");
  assertEquals(monday.until, "1400");
  assertFalse(monday.text);

  assertEquals(tuesdayMorning.day, WeekDays.Tuesday);
  assertEquals(tuesdayMorning.from, "0800");
  assertEquals(tuesdayMorning.until, "1200");
  assertFalse(tuesdayMorning.text);

  assertEquals(tuesdayAfternoon.day, WeekDays.Tuesday);
  assertEquals(tuesdayAfternoon.from, "1230");
  assertEquals(tuesdayAfternoon.until, "1730");
  assertEquals(tuesdayAfternoon.text, "test");
});

Deno.test("Json::fromData(input, options?)", () => {
  const converter = new Json();
  const result = converter.fromData(
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
    defaultOptions,
  );

  const [monday] = result[WeekDays.Monday];
  const [tuesdayMorning, tuesdayAfternoon] = result[WeekDays.Tuesday];

  assertEquals(monday.from, new Date("2021-09-27T08:00"));
  assertEquals(monday.until, new Date("2021-09-27T12:00"));

  assertEquals(tuesdayMorning.from, new Date("2021-09-28T08:00"));
  assertEquals(tuesdayMorning.until, new Date("2021-09-28T12:00"));

  assertEquals(tuesdayAfternoon.from, new Date("2021-09-28T12:30"));
  assertEquals(tuesdayAfternoon.until, new Date("2021-09-28T17:30"));
});
