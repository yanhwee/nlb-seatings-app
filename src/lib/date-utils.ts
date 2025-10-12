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

/* Date helpers */

export function roundUpQuarterHour(date: Date): Date {
  const newDate = new Date(date)
  const minutesToAdd = 15 - (date.getMinutes() % 15)
  newDate.setMinutes(newDate.getMinutes() + minutesToAdd)
  return newDate
}

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

export function isFullHour(date: Date) {
  return (
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  )
}
