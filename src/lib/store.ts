import { LibraryId } from "./types"
import {
  diffLocalDays,
  getLocalDaysSinceEpoch,
} from "./date-utils"

interface Store<K, V> {
  get: (k: K) => V | null
  set: (k: K, v: V) => void
  del: (k: K) => void
}

function makeSimpleStore<K, K1 extends number | string, V>(
  hash: (k: K) => K1,
): Store<K, V> {
  const store = new Map<K1, V>()
  return {
    get: (k: K) => store.get(hash(k)) ?? null,
    set: (k: K, v: V) => store.set(hash(k), v),
    del: (k: K) => store.delete(hash(k)),
  }
}

function makeGetLibraryInfoStore<V>(): Store<[], V> {
  let store: V | null = null
  return {
    get: ([]) => store,
    set: ([], v: V) => {
      store = v
    },
    del: ([]) => {
      store = null
    },
  }
}

function makeGetLibraryAvailabilityStore<V>(): Store<
  [LibraryId, Date],
  V
> {
  // return makeSimpleStore(
  //   ([libraryId, date]) =>
  //     `${libraryId}-${formatLocalDate(date, "yyyy-MM-dd")}`,
  // )
  const store: Map<LibraryId, V>[] = [new Map(), new Map()]
  let storeTime = new Date()
  const getIndex = (date: Date) => {
    // Check date
    const now = new Date()
    const checkDate = () => {
      const daysDiff = diffLocalDays(date, now)
      return 0 <= daysDiff && daysDiff <= 1
    }
    if (!checkDate()) return null
    // Refresh store
    const refreshStore = () => {
      const daysDiff = diffLocalDays(now, storeTime)
      if (daysDiff >= 2) {
        store[0].clear()
        store[1].clear()
      } else if (daysDiff == 1) {
        const index = getLocalDaysSinceEpoch(storeTime) % 2
        store[index].clear()
      }
      storeTime = now
    }
    refreshStore()
    return getLocalDaysSinceEpoch(date) % 2
  }
  return {
    get: ([libraryId, date]) => {
      const index = getIndex(date)
      if (!index) return null
      return store[index].get(libraryId) ?? null
    },
    set: ([libraryId, date], v) => {
      const index = getIndex(date)
      if (!index) return
      store[index].set(libraryId, v)
    },
    del: ([libraryId, date]) => {
      const index = getIndex(date)
      if (!index) return
      store[index].delete(libraryId)
    },
  }
}

function makeGetLibraryAreasMapUrlStore<V>(): Store<
  [LibraryId],
  V
> {
  return makeSimpleStore(([k]) => k)
}

export {
  makeGetLibraryAreasMapUrlStore,
  makeGetLibraryAvailabilityStore,
  makeGetLibraryInfoStore,
}

export type { Store }
