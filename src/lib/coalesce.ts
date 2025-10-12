/* eslint-disable @typescript-eslint/no-explicit-any */

import { formatLocalDate, setLocalHHmm } from "./date-utils"
import { LibraryId } from "./types"
import { getOrCreate } from "./utils"

interface Store<K, V> {
  get: (k: K) => V | null
  set: (k: K, v: V) => void
  del: (k: K) => void
}

type Coalesce<Args extends any[], T> = (
  f: (...args: Args) => Promise<T>,
) => (...args: Args) => Promise<T>

function makeCoalesce<Args extends any[], T>(
  makeStore: () => Store<Args, Promise<T>>,
): Coalesce<Args, T> {
  const store = makeStore()
  return (fn) =>
    (...args: Args) => {
      const promise = store.get(args)
      if (promise !== null) return promise
      const promise_ = fn(...args).finally(() => {
        store.del(args)
      })
      store.set(args, promise_)
      return promise_
    }
}

function makeLibraryInfoStore<V>(): Store<[], V> {
  let store: V | null = null
  return {
    get: ([]) => store,
    set: ([], v) => {
      store = v
    },
    del: ([]) => {
      store = null
    },
  }
}

function makeLibraryAvailaibilityStore<V>(): Store<
  [LibraryId, Date],
  V
> {
  const store = new Map<string, Map<LibraryId, V>>()
  const formatDate = (date: Date) =>
    formatLocalDate(setLocalHHmm(date, "0000"), "YYYY-MM-dd")
  return {
    get: ([libraryId, date]) =>
      store.get(formatDate(date))?.get(libraryId) ?? null,
    set: ([libraryId, date], v) => {
      getOrCreate(store, formatDate(date), () => new Map()).set(
        libraryId,
        v,
      )
    },
    del: ([libraryId, date]) => {
      store.get(formatDate(date))?.delete(libraryId)
    },
  }
}

function makeLibraryAreasMapUrlStore<V>(): Store<
  [LibraryId],
  V
> {
  const store = new Map<LibraryId, V>()
  return {
    get: ([libraryId]) => store.get(libraryId) ?? null,
    set: ([libraryId], v) => store.set(libraryId, v),
    del: ([libraryId]) => store.delete(libraryId),
  }
}

function makeLibraryInfoCoalesce<V>(): Coalesce<[], V> {
  return makeCoalesce(makeLibraryInfoStore<Promise<V>>)
}

function makeLibraryAvailiabilityCoalesce<V>(): Coalesce<
  [LibraryId, Date],
  V
> {
  return makeCoalesce(makeLibraryAvailaibilityStore<Promise<V>>)
}

function makeLibraryAreasMapUrlCoalesce<V>(): Coalesce<
  [LibraryId],
  V
> {
  return makeCoalesce(makeLibraryAreasMapUrlStore<Promise<V>>)
}

export {
  makeLibraryInfoCoalesce,
  makeLibraryAvailiabilityCoalesce,
  makeLibraryAreasMapUrlCoalesce,
}
