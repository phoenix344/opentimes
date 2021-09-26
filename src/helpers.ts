export function normalizeLocalDate(date: Date, timeZone?: string | undefined) {
  // Hack: I'm using the "sv" locale from sweden,
  // because it's similar to the ISO DateTime format.
  const result = date.toLocaleString("sv", { timeZone });
  return new Date(result.replace(" ", "T"));
}
