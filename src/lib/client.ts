import {
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  makeCachedRefresh,
  makeLibraryAreasMapUrlCache,
  makeLibraryAvailabilityCache,
  Timestamp,
} from "./cache"
import * as server from "@/lib/server"
import { useReactiveCachedRefresh } from "./cache-react"
import { AreaId, LibraryAvailability, LibraryId } from "./types"
import {
  makeLibraryAreasMapUrlCoalesce,
  makeLibraryAvailiabilityCoalesce,
} from "./coalesce"

/* Library Availability */

const getLibraryAvailabilityCache =
  makeLibraryAvailabilityCache()

const libraryAvailabilityCoalesce =
  makeLibraryAvailiabilityCoalesce<
    Timestamp<LibraryAvailability>
  >()

const getLibraryAvailabilityRefresh = makeCachedRefresh(
  getLibraryAvailabilityCache,
  libraryAvailabilityCoalesce(
    server.getTimestampLibraryAvailability,
  ),
)

const useLibraryAvailability = (
  libraryId: LibraryId,
  date: Date,
) =>
  useReactiveCachedRefresh(
    getLibraryAvailabilityRefresh,
    [libraryId, date],
    LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  )

/* Library Areas Map Url */

const getLibraryAreasMapUrlCache = makeLibraryAreasMapUrlCache()

const libraryAreasMapUrlCoalesce =
  makeLibraryAreasMapUrlCoalesce<
    Timestamp<Map<AreaId, [string, string] | null>>
  >()

const getLibraryAreasMapUrlRefresh = makeCachedRefresh(
  getLibraryAreasMapUrlCache,
  libraryAreasMapUrlCoalesce(
    server.getTimestampLibraryAreasMapUrl,
  ),
)

const useLibraryAreasMapUrl = (libraryId: LibraryId) =>
  useReactiveCachedRefresh(
    getLibraryAreasMapUrlRefresh,
    [libraryId],
    LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  )

export { useLibraryAvailability, useLibraryAreasMapUrl }
