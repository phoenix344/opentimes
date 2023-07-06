import { OpeningHoursOptions } from "../interfaces.ts";
import { WeekDays, WeekDaysShort } from "../WeekDays.ts";
import { Microdata } from "./Microdata.ts";
import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";

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
    open: "open",
    timespanSeparator: " - ",
    weekDays: WeekDaysShort,
  },
  showClosedDays: false,
};

Deno.test("Microdata converter: creates single string output", () => {
  const microdata = new Microdata();
  const result = microdata.toData(
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
        },
      ],
      [
        /** wednesday */
        {
          from: new Date("2021-09-29T08:00"),
          until: new Date("2021-09-29T14:00"),
        },
      ],
      [
        /** thursday */
        {
          from: new Date("2021-09-30T08:00"),
          until: new Date("2021-09-30T14:00"),
        },
      ],
      [
        /** friday */
        {
          from: new Date("2021-10-01T08:00"),
          until: new Date("2021-10-01T14:00"),
        },
      ],
      [
        /** saturday */
      ],
    ],
    defaultOptions,
  );
  assertEquals(result, [
    "Mo,We-Fr 08:00-14:00",
    "Tu 08:00-12:00",
    "Tu 12:30-17:30",
  ]);
});

Deno.test("Microdata converter: creates multiple string output", () => {
  const microdata = new Microdata();
  const result = microdata.fromData(
    ["Mo,We-Fr 08:00-14:00", "Tu 08:00-12:00", "Tu 12:30-17:30"],
    defaultOptions,
  );

  assertEquals(result, [
    [
      /** sunday */
    ],
    [
      /** monday */
      {
        from: new Date("2021-09-27T08:00"),
        until: new Date("2021-09-27T14:00"),
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
      },
    ],
    [
      /** wednesday */
      {
        from: new Date("2021-09-29T08:00"),
        until: new Date("2021-09-29T14:00"),
      },
    ],
    [
      /** thursday */
      {
        from: new Date("2021-09-30T08:00"),
        until: new Date("2021-09-30T14:00"),
      },
    ],
    [
      /** friday */
      {
        from: new Date("2021-10-01T08:00"),
        until: new Date("2021-10-01T14:00"),
      },
    ],
    [
      /** saturday */
    ],
  ]);
});
