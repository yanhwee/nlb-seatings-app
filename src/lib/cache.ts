import {
  makeGetLibraryAreasMapUrlStore,
  makeGetLibraryAvailabilityStore,
  makeGetLibraryInfoStore,
} from "./store"
import { LibraryId } from "./types"

const LIBRARY_INFO_CACHE_DURATION_MS = 10 * 60 * 1000
const LIBRARY_AVAILABILITY_CACHE_DURATION_MS = 5 * 60 * 1000
const LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS = 10 * 60 * 1000

type Duration = number // in ms
type Time = Duration // since epoch
type Timestamp<T> = [Time | Duration, T]

interface Cached<K, V> {
  get: (k: K) => V | null
  set: (k: K, v: V) => void
}

interface CachedFn<K, V> {
  cache: (k: K) => V | null
  update: (k: K) => Promise<V>
}

type TimedCachedFn<K, V> = CachedFn<K, Timestamp<V>>

function timestampGetPromise<Args extends unknown[], T>(
  getPromise: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<Timestamp<T>> {
  return async (...args: Args): Promise<Timestamp<T>> => {
    const value = await getPromise(...args)
    const timestamp = new Date().getTime()
    return [timestamp, value]
  }
}

function getWaitDuration(
  now: Time,
  timestamp: Time,
  cacheDurationMs: Time,
) {
  const elapsed = now - timestamp
  const duration = cacheDurationMs - elapsed
  return duration
}

async function resolveTimedCachedFnStrict<K, V>(
  cachedFn: TimedCachedFn<K, V>,
  args: K,
  cacheDurationMs: Duration,
): Promise<Timestamp<V>> {
  const cache = cachedFn.cache(args)
  if (cache === null) return cachedFn.update(args)
  const timestamp = cache[0]
  const now = new Date().getTime()
  const duration = getWaitDuration(
    now,
    timestamp,
    cacheDurationMs,
  )
  const isOutdated = duration <= 0
  if (isOutdated) return cachedFn.update(args)
  return cache
}

function makeCachedFn<K, V>(
  makeCache: () => Cached<K, V>,
  fn: (k: K) => Promise<V>,
): CachedFn<K, V> {
  const cache = makeCache()
  return {
    cache: cache.get,
    update: async (k: K) => {
      const v = await fn(k)
      cache.set(k, v)
      return v
    },
  }
}

function makeLibraryInfoTimedCachedFn<V>(
  fn: () => Promise<Timestamp<V>>,
): TimedCachedFn<[], V> {
  return makeCachedFn(makeGetLibraryInfoStore<Timestamp<V>>, fn)
}

function makeLibraryAvailabilityTimedCachedFn<V>(
  fn: (
    libraryId: LibraryId,
    date: Date,
  ) => Promise<Timestamp<V>>,
): TimedCachedFn<[LibraryId, Date], V> {
  return makeCachedFn(
    makeGetLibraryAvailabilityStore<Timestamp<V>>,
    ([libraryId, date]) => fn(libraryId, date),
  )
}

function makeLibraryAreasMapUrlTimedCachedFn<V>(
  fn: (libraryId: LibraryId) => Promise<Timestamp<V>>,
): TimedCachedFn<[LibraryId], V> {
  return makeCachedFn(
    makeGetLibraryAreasMapUrlStore<Timestamp<V>>,
    ([libraryId]) => fn(libraryId),
  )
}

export type {
  Duration,
  Time,
  Timestamp,
  Cached,
  CachedFn,
  TimedCachedFn,
}

export {
  makeLibraryAreasMapUrlTimedCachedFn,
  makeLibraryAvailabilityTimedCachedFn,
  makeLibraryInfoTimedCachedFn,
  timestampGetPromise,
  resolveTimedCachedFnStrict,
  getWaitDuration,
  LIBRARY_INFO_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
}
