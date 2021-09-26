/**
 * Create a simplified 24h time format without any separator.
 */
export function convertToSimpleFormat(date: Date, timeZone?: string) {
  const [hours, minutes, seconds] = date
    .toLocaleTimeString("sv", { timeZone })
    .split(":");
  return (
    ("00" + hours).slice(-2) +
    ("00" + minutes).slice(-2) +
    (seconds !== "00" ? ("00" + seconds).slice(-2) : "")
  );
}
