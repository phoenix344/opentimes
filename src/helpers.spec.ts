import { fromRemoteDate } from "./helpers";

describe("helpers", () => {
  it("toLocaleDate(date, options)", () => {
    const a = new Date("2021-09-30T12:30");
    const b = new Date("2021-09-30T12:30-0400");
    expect(toRemoteDate(a, "America/New_York")).toStrictEqual(b);
    expect(toRemoteDate(a, "Australia/Melbourne")).not.toStrictEqual(b);
  });

  it("fromLocaleDate(date, options)", () => {
    const a = new Date("2021-09-30T12:30");
    const b = new Date("2021-09-30T12:30-0400");
    expect(fromRemoteDate(b, "America/New_York")).toStrictEqual(a);
    expect(fromRemoteDate(b, "Australia/Melbourne")).not.toStrictEqual(a);
  });
});
