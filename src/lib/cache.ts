/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AreaId,
  LibraryAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"
import {
  getOrCreate,
  isToday,
  isTomorrow,
  isYesterday,
} from "./utils"

const LIBRARY_INFO_CACHE_DURATION_MS = 10 * 60 * 1000
const LIBRARY_AVAILABILITY_CACHE_DURATION_MS = 5 * 60 * 1000
const LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS = 10 * 60 * 1000

/* Ref */

class Ref<T> {
  constructor(public value: T) {}
}

/* Time */

type Duration = number // in ms
type Time = Duration // since epoch
type Timestamp<T> = [Time | Duration, T]

/* Refresh */

type Refresh<A, B extends A> = [A, () => Promise<B>]
type CachedRefresh<T> = Refresh<
  Timestamp<T> | null,
  Timestamp<T>
>
type TimedRefresh<A, B extends A> = Refresh<
  Timestamp<A>,
  Timestamp<B>
>

/* Get Refresh */

type GetRef<Args extends any[], T> = (...args: Args) => Ref<T>
type GetPromise<Args extends any[], T> = (
  ...args: Args
) => Promise<T>
type GetRefresh<Args extends any[], A, B extends A> = (
  ...args: Args
) => Refresh<A, B>

/* Get Cached Refresh */

type GetCache<Args extends any[], T> = GetRef<
  Args,
  Timestamp<T> | null
>
type GetValue<Args extends any[], T> = GetPromise<
  Args,
  Timestamp<T>
>
type GetCachedRefresh<Args extends any[], T> = GetRefresh<
  Args,
  Timestamp<T> | null,
  Timestamp<T>
>

/* Make Refresh */

function makeRefresh<Args extends any[], A, B extends A>(
  getRef: GetRef<Args, A>,
  getPromise: GetPromise<Args, B>,
): GetRefresh<Args, A, B> {
  return (...args: Args): Refresh<A, B> => {
    const ref = getRef(...args)
    const newValue = async () => {
      const value = await getPromise(...args)
      ref.value = value
      return value
    }
    return [ref.value, newValue]
  }
}

function makeCachedRefresh<Args extends any[], T>(
  getCache: GetCache<Args, T>,
  getValue: GetValue<Args, T>,
): GetCachedRefresh<Args, T> {
  return makeRefresh(getCache, getValue)
}

/* Cache helper functions */

function getWaitDuration(
  cacheDurationMs: Duration,
  timestamp: Time,
) {
  const now = new Date().getTime()
  const elapsed = now - timestamp
  const waitDuration = cacheDurationMs - elapsed
  return waitDuration
}

/* Cache Refresh functions */

function timestampGetPromise<Args extends any[], T>(
  getPromise: GetPromise<Args, T>,
): GetValue<Args, T> {
  return async (...args: Args): Promise<Timestamp<T>> => {
    const value = await getPromise(...args)
    const timestamp = new Date().getTime()
    return [timestamp, value]
  }
}

async function resolveCachedRefreshStrict<T>(
  refresh: CachedRefresh<T>,
  cacheDurationMs: Duration,
): Promise<Timestamp<T>> {
  const [value, update] = refresh
  if (value === null) return update()
  const timestamp = value[0]
  const isOutdated =
    getWaitDuration(cacheDurationMs, timestamp) <= 0
  if (!isOutdated) return value
  return update()
}

/* Make Cache */

function makeLibraryInfoCache(): GetCache<[], LibraryInfo> {
  const libraryInfo = new Ref(null)
  return () => libraryInfo
}

function makeLibraryAvailabilityCache(): GetCache<
  [LibraryId, Date],
  LibraryAvailability
> {
  let cacheDate = new Date()
  let todayLibraryAvailabilities = new Map()
  let tomorrowLibraryAvailabilities = new Map()
  return (libraryId, date) => {
    if (!isToday(cacheDate)) {
      if (isYesterday(cacheDate)) {
        todayLibraryAvailabilities =
          tomorrowLibraryAvailabilities
      } else {
        todayLibraryAvailabilities = new Map()
      }
      tomorrowLibraryAvailabilities = new Map()
      cacheDate = new Date()
    }
    const libraryAvailabilities = isToday(date)
      ? todayLibraryAvailabilities
      : isTomorrow(date)
        ? tomorrowLibraryAvailabilities
        : null
    if (libraryAvailabilities === null) throw new Error()
    return getOrCreate(
      libraryAvailabilities,
      libraryId,
      () => new Ref(null),
    )
  }
}

function makeLibraryAreasMapUrlCache(): GetCache<
  [LibraryId],
  Map<AreaId, [string, string]>
> {
  const libraryAreasMapUrl = new Map()
  return (libraryId) =>
    getOrCreate(
      libraryAreasMapUrl,
      libraryId,
      () => new Ref(null),
    )
}

export type {
  Duration,
  Time,
  Timestamp,
  Refresh,
  CachedRefresh,
  TimedRefresh,
}

export {
  Ref,
  makeCachedRefresh,
  getWaitDuration,
  timestampGetPromise,
  resolveCachedRefreshStrict,
  makeLibraryInfoCache,
  makeLibraryAvailabilityCache,
  makeLibraryAreasMapUrlCache,
  LIBRARY_INFO_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
}
