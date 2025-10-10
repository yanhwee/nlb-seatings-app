import {
  AreaId,
  LibraryAvailability,
  LibraryId,
  LibraryInfo,
} from "@/lib/types"
import { isToday, isTomorrow } from "@/lib/utils"

const LIBRARY_INFO_CACHE_DURATION_MS = 10 * 60 * 1000
const LIBRARY_AVAILABILITY_CACHE_DURATION_MS = 5 * 60 * 1000
const LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS = 10 * 60 * 1000

class CachedRef<T> {
  value: T | null = null
  timestamp: number = 0
  promise: Promise<T> | null = null
}

class Cached<T> {
  constructor(
    private ref: CachedRef<T>,
    private fetcher: () => Promise<T>,
    private cacheDurationMs: number,
  ) {}
  public data(): T | null {
    return this.ref.value
  }
  public validate(): Promise<T> | null {
    const ref = this.ref
    if (ref.promise) return ref.promise
    if (ref.value) {
      const now = Date.now()
      const elapsed = now - ref.timestamp
      if (elapsed < this.cacheDurationMs) return null
    }
    ref.promise = this.fetcher().then((value) => {
      ref.value = value
      ref.timestamp = Date.now()
      ref.promise = null
      return value
    })
    return ref.promise
  }
  public async lazy(): Promise<T> {
    const data = this.data()
    const validated = this.validate()
    return data !== null ? data : validated!
  }
  public async strict(): Promise<T> {
    const data = this.data()
    const validated = this.validate()
    return validated !== null ? validated : data!
  }
}

function cacheLibraryInfo(
  getLibraryInfo: () => Promise<LibraryInfo>,
  cacheDurationMs: number,
): () => Cached<LibraryInfo> {
  const libraryInfo = new CachedRef<LibraryInfo>()
  return () =>
    new Cached(libraryInfo, getLibraryInfo, cacheDurationMs)
}

enum Day {
  Today,
  Tomorrow,
}

function cacheLibraryAvailability(
  getLibraryAvailability: (
    libraryId: LibraryId,
    date: Date,
  ) => Promise<LibraryAvailability>,
  cacheDurationMs: number,
): (
  libraryId: LibraryId,
  date: Date,
) => Cached<LibraryAvailability> {
  const libraryAvailabilities: Record<
    Day,
    Map<LibraryId, CachedRef<LibraryAvailability>>
  > = {
    [Day.Today]: new Map(),
    [Day.Tomorrow]: new Map(),
  }
  return (libraryId: LibraryId, date: Date) => {
    const day = isToday(date)
      ? Day.Today
      : isTomorrow(date)
        ? Day.Tomorrow
        : null
    if (day === null) throw new Error()
    let libraryAvailability =
      libraryAvailabilities[day].get(libraryId)
    if (!libraryAvailability) {
      libraryAvailability = new CachedRef<LibraryAvailability>()
      libraryAvailabilities[day].set(
        libraryId,
        libraryAvailability,
      )
    }
    return new Cached(
      libraryAvailability,
      () => getLibraryAvailability(libraryId, date),
      cacheDurationMs,
    )
  }
}

function cacheLibraryAreasMapUrl(
  getLibraryAreasMapUrl: (
    libraryId: LibraryId,
  ) => Promise<Map<AreaId, [string, string] | null>>,
  cacheDurationMs: number,
): (
  libraryId: LibraryId,
) => Cached<Map<AreaId, [string, string] | null>> {
  const cacheRefs: Map<
    LibraryId,
    CachedRef<Map<AreaId, [string, string] | null>>
  > = new Map()
  return (libraryId: LibraryId) => {
    let cacheRef = cacheRefs.get(libraryId)
    if (!cacheRef) {
      cacheRef = new CachedRef()
      cacheRefs.set(libraryId, cacheRef)
    }
    return new Cached(
      cacheRef,
      () => getLibraryAreasMapUrl(libraryId),
      cacheDurationMs,
    )
  }
}

export {
  CachedRef,
  Cached,
  cacheLibraryInfo,
  cacheLibraryAvailability,
  cacheLibraryAreasMapUrl,
  LIBRARY_INFO_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
}
