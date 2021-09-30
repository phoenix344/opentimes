import { OpenState } from "./OpenState";
import { OpeningHoursOptions, OpenTimeInternal } from "./interfaces";

export function normalizeLocalDate(date: Date, timeZone?: string | undefined) {
  // Hack: I'm using the "sv" locale from sweden,
  // because it's similar to the ISO DateTime format.
  const result = date.toLocaleString("sv", { timeZone });
  return new Date(result.replace(" ", "T"));
}

export function normalizeUntilTime(date: Date) {
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    date.setHours(23);
    date.setMinutes(59);
  }
}

export function sortTimespan(times: OpenTimeInternal[]) {
  times.sort((a, b) =>
    a.from < b.from || a.until < b.from ? -1 : a.from > b.until ? 1 : 0
  );
}

export function mergeTimespans(times: OpenTimeInternal[]) {
  const tmp = times.splice(0);
  let last!: OpenTimeInternal;
  for (const time of tmp) {
    if (!last || time.from > last.until) {
      times.push(time);
      last = time;
    } else if (time.until > last.until) {
      last.until = time.until;
    }
  }
}

export function cutTimespans(
  openTimes: OpenTimeInternal[][],
  removables: unknown[]
) {
  for (const removable of removables as OpenTimeInternal[]) {
    if (!removable) {
      continue;
    }
    const times = openTimes[removable.from.getDay()];
    const tmp = times.splice(0);
    for (const time of tmp) {
      // no remove operation needed
      if (time.from > removable.until || time.until < removable.from) {
        times.push(time);
      }

      // cut in two time objects
      else if (time.from < removable.from && time.until > removable.until) {
        times.push(
          {
            from: time.from,
            until: removable.from,
          },
          {
            from: removable.until,
            until: time.until,
          }
        );
      }

      // cut start time (from)
      else if (
        time.from >= removable.from &&
        time.from <= removable.until &&
        time.until > removable.until
      ) {
        times.push({
          from: removable.until,
          until: time.until,
        });
      }

      // cut end time (until)
      else if (
        time.until <= removable.until &&
        time.until >= removable.from &&
        time.from < removable.from
      ) {
        times.push({
          from: time.from,
          until: removable.from,
        });
      }
    }
  }
}

export function postOptimize(openTimes: OpenTimeInternal[][]) {
  for (const times of openTimes.values()) {
    sortTimespan(times);
    mergeTimespans(times);
  }
}

export function getState(
  openTimes: OpenTimeInternal[][],
  options: OpeningHoursOptions,
  now = new Date()
) {
  // make sure the timeZone is set with a value.
  // At least the local time of the current client.
  const { timeZone } = Intl.DateTimeFormat(
    options.locales,
    options.dateTimeFormatOptions
  ).resolvedOptions();
  const current = normalizeLocalDate(now, timeZone);
  const day = current.getDay();
  for (const time of openTimes[day]) {
    const from = combineDateTime(current, time.from);
    const until = combineDateTime(current, time.until);
    if (from <= current && until >= current) {
      return OpenState.Open;
    }
  }
  return OpenState.Closed;
}

export function createDateTime(date: Date, day: number, timeStr: string) {
  const [dateStr] = date.toISOString().split("T");
  const datetime = new Date(dateStr + "T" + timeStr);
  const offset = day - datetime.getDay();
  datetime.setDate(datetime.getDate() + offset);
  return datetime;
}

export function combineDateTime(date: Date, time: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds()
  );
}
