/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import {
  TimedRefresh,
  Duration,
  CachedRefresh,
  Timestamp,
  getWaitDuration,
} from "./cache"

function checkArgsSame(args1: any[], args2: any[]) {
  if (args1 === args2) return true
  if (args1.length !== args2.length) return false
  for (let i = 0; i < args1.length; i++)
    if (args1[i] != args2[i]) return false
  return true
}

function useReactiveTimedRefresh<
  Args extends any[],
  A,
  B extends A,
>(
  getRefresh: (...args: Args) => TimedRefresh<A, B>,
  args: Args,
): A | null {
  const [prevArgs, setPrevArgs] = useState<Args | null>(null)
  const [data, setData] = useState<A | null>(null)
  useEffect(() => {
    console.log("%s Effect is getting called...", new Date())
    const [[duration, value], update] = getRefresh(...args)
    setData(value)
    setPrevArgs(args)
    let ignore = false
    const callback = (duration: Duration) =>
      setTimeout(async () => {
        const [duration_, value_] = await update()
        if (ignore) return
        setData(value_)
        timeoutId = callback(duration_)
      }, duration)
    let timeoutId = callback(duration)
    return () => {
      ignore = true
      clearTimeout(timeoutId)
    }
  }, args) // ideally getRefresh should be here...

  if (prevArgs === null || !checkArgsSame(prevArgs, args))
    return null
  return data
}

function convertCachedToTimedRefresh<T>(
  cacheDurationMs: Duration,
  refresh: CachedRefresh<T>,
): TimedRefresh<T | null, T> {
  const [initial, update] = refresh
  const newUpdate = async (): Promise<Timestamp<T>> => {
    const [timestamp, value] = await update()
    const waitDuration = getWaitDuration(
      cacheDurationMs,
      timestamp,
    )
    return [waitDuration, value]
  }
  if (initial === null) return [[0, null], newUpdate]
  const [timestamp, value] = initial
  const waitDuration = getWaitDuration(
    cacheDurationMs,
    timestamp,
  )
  const isOutdated = waitDuration <= 0
  const value_ = isOutdated ? null : value
  return [[waitDuration, value_], newUpdate]
}

function useReactiveCachedRefresh<Args extends any[], T>(
  getRefresh: (...args: Args) => CachedRefresh<T>,
  args: Args,
  cacheDurationMs: Duration,
) {
  return useReactiveTimedRefresh(
    (...args: Args) =>
      convertCachedToTimedRefresh(
        cacheDurationMs,
        getRefresh(...args),
      ),
    args,
  )
}

export { useReactiveCachedRefresh }
