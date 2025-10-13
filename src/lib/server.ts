"use server"

import {
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  LIBRARY_INFO_CACHE_DURATION_MS,
  makeLibraryAreasMapUrlTimedCachedFn,
  makeLibraryAvailabilityTimedCachedFn,
  makeLibraryInfoTimedCachedFn,
  resolveTimedCachedFnStrict,
  Timestamp,
  timestampGetPromise,
} from "./cache"
import {
  makeGetLibraryAreasMapUrlCoalesce,
  makeGetLibraryAvailiabilityCoalesce,
  makeGetLibraryInfoCoalesce,
} from "./coalesce"
import * as service from "@/lib/service"
import {
  AreaId,
  LibraryAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"

/* Library Info */

const getLibraryInfoCoalesce =
  makeGetLibraryInfoCoalesce<Timestamp<LibraryInfo>>()

const libraryInfoTimedCachedFn = makeLibraryInfoTimedCachedFn(
  timestampGetPromise(service.getLibraryInfo),
)

const getTimedLibraryInfo = getLibraryInfoCoalesce(() =>
  resolveTimedCachedFnStrict(
    libraryInfoTimedCachedFn,
    [],
    LIBRARY_INFO_CACHE_DURATION_MS,
  ),
)

const getLibraryInfo = () =>
  getTimedLibraryInfo().then((v) => v[1])

/* Library Availability */

const getLibraryAvailabilityCoalesce =
  makeGetLibraryAvailiabilityCoalesce<
    Timestamp<LibraryAvailability>
  >()

const libraryAvailabilityTimedCachedFn =
  makeLibraryAvailabilityTimedCachedFn(
    timestampGetPromise(async (libraryId, date) =>
      service.getLibraryAvailability(
        await getLibraryInfo(),
        libraryId,
        date,
      ),
    ),
  )

const getTimedLibraryAvailability =
  getLibraryAvailabilityCoalesce(
    (libraryId: LibraryId, date: Date) =>
      resolveTimedCachedFnStrict(
        libraryAvailabilityTimedCachedFn,
        [libraryId, date],
        LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
      ),
  )

/* Library Areas Map Url */

const getLibraryAreasMapUrlCoalesce =
  makeGetLibraryAreasMapUrlCoalesce<
    Timestamp<Map<AreaId, [string, string] | null>>
  >()

const libraryAreasMapUrlTimedCachedFn =
  makeLibraryAreasMapUrlTimedCachedFn(
    timestampGetPromise(async (libraryId) =>
      service.getLibraryAreasMapUrl(
        libraryId,
        (await getLibraryInfo()).get(libraryId)!.areaInfo,
      ),
    ),
  )

const getTimedLibraryAreasMapUrl =
  getLibraryAreasMapUrlCoalesce((libraryId: LibraryId) =>
    resolveTimedCachedFnStrict(
      libraryAreasMapUrlTimedCachedFn,
      [libraryId],
      LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
    ),
  )

export {
  getLibraryInfo,
  getTimedLibraryAvailability,
  getTimedLibraryAreasMapUrl,
}
