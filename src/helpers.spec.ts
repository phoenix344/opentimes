import { fromRemoteDate, toRemoteDate } from "./helpers.ts";
import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.193.0/testing/asserts.ts";

Deno.test("helpers: toRemoteDate(date, options)", () => {
  const a = new Date("2021-09-30T12:30");
  const b = new Date("2021-09-30T12:30-0400");
  assertEquals(toRemoteDate(a, "America/New_York"), b);
  assertNotEquals(toRemoteDate(a, "Australia/Melbourne"), b);
});

Deno.test("helpers: fromRemoteDate(date, options)", () => {
  const a = new Date("2021-09-30T12:30");
  const b = new Date("2021-09-30T12:30-0400");
  assertEquals(fromRemoteDate(b, "America/New_York"), a);
  assertNotEquals(fromRemoteDate(b, "Australia/Melbourne"), a);
});
