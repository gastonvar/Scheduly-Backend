const HOUR_MS = 60 * 60 * 1000;

export function getClassEndDate(date: Date, durationHours: number): Date {
  return new Date(date.getTime() + durationHours * HOUR_MS);
}

export function timeRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

export function classesOverlap(
  start: Date,
  durationHours: number,
  existingStart: Date,
  existingDurationHours: number,
): boolean {
  return timeRangesOverlap(
    start,
    getClassEndDate(start, durationHours),
    existingStart,
    getClassEndDate(existingStart, existingDurationHours),
  );
}
