"use server"

import {
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  LIBRARY_INFO_CACHE_DURATION_MS,
  makeCachedRefresh,
  makeLibraryAreasMapUrlCache,
  makeLibraryAvailabilityCache,
  makeLibraryInfoCache,
  resolveCachedRefreshStrict,
  Timestamp,
  timestampGetPromise,
} from "./cache"
import * as service from "@/lib/service"
import {
  AreaId,
  LibraryAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"
import {
  makeLibraryAreasMapUrlCoalesce,
  makeLibraryAvailiabilityCoalesce,
  makeLibraryInfoCoalesce,
} from "./coalesce"

/* Library Info */

const getLibraryInfoCache = makeLibraryInfoCache()

const getLibraryInfoRefresh = makeCachedRefresh(
  getLibraryInfoCache,
  timestampGetPromise(service.getLibraryInfo),
)

const libraryInfoCoalesce =
  makeLibraryInfoCoalesce<Timestamp<LibraryInfo>>()

const getTimestampLibraryInfo = libraryInfoCoalesce(() =>
  resolveCachedRefreshStrict(
    getLibraryInfoRefresh(),
    LIBRARY_INFO_CACHE_DURATION_MS,
  ),
)

const getLibraryInfo = async () =>
  (await getTimestampLibraryInfo())[1]

/* Library Availability */

const getLibraryAvailabilityCache =
  makeLibraryAvailabilityCache()

const getLibraryAvailabilityRefresh = makeCachedRefresh(
  getLibraryAvailabilityCache,
  timestampGetPromise(async (libraryId, date) =>
    service.getLibraryAvailability(
      await getLibraryInfo(),
      libraryId,
      date,
    ),
  ),
)

const libraryAvailabilityCoalesce =
  makeLibraryAvailiabilityCoalesce<
    Timestamp<LibraryAvailability>
  >()

const getTimestampLibraryAvailability =
  libraryAvailabilityCoalesce(
    (libraryId: LibraryId, date: Date) =>
      resolveCachedRefreshStrict(
        getLibraryAvailabilityRefresh(libraryId, date),
        LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
      ),
  )

/* Library Areas Map Url */

const getLibraryAreasMapUrlCache = makeLibraryAreasMapUrlCache()

const getLibraryAreasMapUrlRefresh = makeCachedRefresh(
  getLibraryAreasMapUrlCache,
  timestampGetPromise(async (libraryId) =>
    service.getLibraryAreasMapUrl(
      libraryId,
      (await getLibraryInfo()).get(libraryId)!.areaInfo,
    ),
  ),
)

const libraryAreasMapUrlCoalesce =
  makeLibraryAreasMapUrlCoalesce<
    Timestamp<Map<AreaId, [string, string] | null>>
  >()

const getTimestampLibraryAreasMapUrl =
  libraryAreasMapUrlCoalesce((libraryId: LibraryId) =>
    resolveCachedRefreshStrict(
      getLibraryAreasMapUrlRefresh(libraryId),
      LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
    ),
  )

export {
  getLibraryInfo,
  getTimestampLibraryAvailability,
  getTimestampLibraryAreasMapUrl,
}
