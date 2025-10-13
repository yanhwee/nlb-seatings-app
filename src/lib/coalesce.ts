import {
  makeGetLibraryAreasMapUrlStore,
  makeGetLibraryAvailabilityStore,
  makeGetLibraryInfoStore,
  Store,
} from "./store"
import { LibraryId } from "./types"

type Coalesce<Args extends unknown[], T> = (
  f: (...args: Args) => Promise<T>,
) => (...args: Args) => Promise<T>

function makeCoalesce<Args extends unknown[], T>(
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

function makeGetLibraryInfoCoalesce<V>(): Coalesce<[], V> {
  return makeCoalesce(makeGetLibraryInfoStore<Promise<V>>)
}

function makeGetLibraryAvailiabilityCoalesce<V>(): Coalesce<
  [LibraryId, Date],
  V
> {
  return makeCoalesce(
    makeGetLibraryAvailabilityStore<Promise<V>>,
  )
}

function makeGetLibraryAreasMapUrlCoalesce<V>(): Coalesce<
  [LibraryId],
  V
> {
  return makeCoalesce(
    makeGetLibraryAreasMapUrlStore<Promise<V>>,
  )
}

export {
  makeGetLibraryInfoCoalesce,
  makeGetLibraryAvailiabilityCoalesce,
  makeGetLibraryAreasMapUrlCoalesce,
}
