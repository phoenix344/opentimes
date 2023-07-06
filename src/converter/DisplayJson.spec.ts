import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { OpeningHoursOptions } from "../interfaces.ts";
import { WeekDays, WeekDaysShort } from "../WeekDays.ts";
import { DisplayJson } from "./DisplayJson.ts";

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

Deno.test("DisplayJson::toData(input, options?)", () => {
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
    defaultOptions,
  );

  assertEquals(monday.day, "mon");
  assertEquals(monday.times[0].from, "08:00");
  assertEquals(monday.times[0].until, "14:00");
  assertEquals(monday.active, false);

  assertEquals(tuesday.day, "tue");
  assertEquals(tuesday.times[0].from, "08:00");
  assertEquals(tuesday.times[0].until, "12:00");
  assertEquals(tuesday.times[1].from, "12:30");
  assertEquals(tuesday.times[1].until, "17:30");
  assertEquals(tuesday.active, true);
});
