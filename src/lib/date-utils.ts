import { DateTime } from "luxon"

/**
 * Timezone handling is required because server / client
 * may not be running in the same timezone as SG.
 *
 * Assumption:
 * 1. All Date object (for entire project) are assumed with
 *    no timezone (ie. time since epoch).
 * 2. All functions here uses local timezone SG.
 *    - e.g. today, tomorrow
 */

/* Timezone helper */

const SG_TZ_IDENTIFIER = "Asia/Singapore"

export function parseLocalISOHHmm(
  localDatetimeStr: string,
): string {
  const dt = DateTime.fromISO(localDatetimeStr, {
    zone: SG_TZ_IDENTIFIER,
  })
  return dt.toFormat("HHmm")
}

export function formatLocalDate(
  date: Date,
  formatStr: string,
): string {
  const dt = DateTime.fromJSDate(date)
  const sgDt = dt.setZone(SG_TZ_IDENTIFIER)
  return sgDt.toFormat(formatStr)
}

export function diffLocalDays(
  date1: Date,
  date2: Date,
): number {
  const dt = (date: Date) =>
    DateTime.fromJSDate(date)
      .setZone(SG_TZ_IDENTIFIER)
      .startOf("day")
  return dt(date1).diff(dt(date2), "days").days
}

export function setLocalHHmm(date: Date, HHmm: string): Date {
  const hours = parseInt(HHmm.substring(0, 2))
  const minutes = parseInt(HHmm.substring(2, 4))
  const dt = DateTime.fromJSDate(date)
  const sgDt = dt.setZone(SG_TZ_IDENTIFIER)
  const newDt = sgDt.set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  })
  return newDt.toJSDate()
}

export function getLocalHours(date: Date): number {
  return DateTime.fromJSDate(date).setZone(SG_TZ_IDENTIFIER)
    .hour
}

export function getLocalDaysSinceEpoch(date: Date): number {
  const epochUtc = DateTime.fromMillis(0, { zone: "utc" })
  const epochSG = epochUtc.setZone(SG_TZ_IDENTIFIER)
  const dt = DateTime.fromJSDate(date)
  const dtSG = dt.setZone(SG_TZ_IDENTIFIER)
  const startOfEpoch = epochSG.startOf("day")
  const startOfDt = dtSG.startOf("day")
  const diff = startOfDt.diff(startOfEpoch, "days")
  return diff.days
}

export function isFullHour(date: Date) {
  const dt = DateTime.fromJSDate(date).setZone(SG_TZ_IDENTIFIER)
  return (
    dt.minute === 0 && dt.second === 0 && dt.millisecond === 0
  )
}

export function roundUpQuarterHour(date: Date): Date {
  const dt = DateTime.fromJSDate(date).setZone(SG_TZ_IDENTIFIER)
  const mins = dt.minute
  const minsToAdd = mins % 15 > 0 ? 15 - (mins % 15) : 0
  const roundedMins = mins + minsToAdd
  const roundedDt = dt.set({
    minute: roundedMins,
    second: 0,
    millisecond: 0,
  })
  return roundedDt.toJSDate()
}

/* Date helpers */

export function maxDate(...dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())))
}

export function minDate(...dates: Date[]): Date {
  return new Date(Math.min(...dates.map((d) => d.getTime())))
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}
