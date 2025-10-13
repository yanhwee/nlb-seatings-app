import { useCallback, useEffect, useState } from "react"
import {
  Duration,
  getWaitDuration,
  TimedCachedFn,
  Timestamp,
} from "./cache"

function useImpure<T>(impure: T): [T, () => void] {
  const [[get], set] = useState<[[T]]>([[impure]])
  const refresh = useCallback(() => set([get]), [get])
  get[0] = impure
  return [impure, refresh]
}

function resolveCacheValue<T>(
  cache: Timestamp<T> | null,
  cacheDurationMs: Duration,
): [Duration, T | null] {
  if (!cache) return [0, null]
  const [timestamp, value] = cache
  const now = new Date().getTime()
  const waitDuration = getWaitDuration(
    now,
    timestamp,
    cacheDurationMs,
  )
  const isOutdated = waitDuration <= 0
  if (isOutdated) return [0, null]
  return [waitDuration, value]
}

function useTimedCachedFn<Args extends unknown[], V>(
  fn: TimedCachedFn<Args, V>,
  args: Args,
  cacheDurationMs: Duration,
): V | null {
  // think it could be improved but...
  // this will be it for now...
  const [{ cache, update }, refresh] = useImpure(fn)
  const value = resolveCacheValue(
    cache(args),
    cacheDurationMs,
  )[1]
  console.log("refresh %s", new Date())
  useEffect(() => {
    const duration = resolveCacheValue(
      cache(args),
      cacheDurationMs,
    )[0]
    console.log("effect %s", duration)
    let ignore = false
    const callback = (duration: Duration) =>
      setTimeout(async () => {
        const cacheValue = await update(args)
        if (ignore) return
        refresh()
        const duration = resolveCacheValue(
          cacheValue,
          cacheDurationMs,
        )[0]
        timeoutId = callback(duration)
      }, duration)
    let timeoutId = callback(duration)
    return () => {
      clearTimeout(timeoutId)
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args, cacheDurationMs, refresh, cache, update])
  return value
}

export { useTimedCachedFn }
