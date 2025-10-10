import * as server from "@/lib/server"
import * as cache from "@/lib/cache"
import { LibraryId } from "./types"
import useSWR from "swr"

function useLibraryAvailability(
  libraryId: LibraryId,
  date: Date,
) {
  const { data, error } = useSWR(
    [libraryId, date],
    ([libraryId, date]) =>
      server.getLibraryAvailability(libraryId, date),
    {
      refreshInterval:
        cache.LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
    },
  )
  return {
    libraryAvailability: data,
    error: error,
  }
}

function useLibraryAreasMapUrl(libraryId: LibraryId) {
  const { data, error } = useSWR(
    [libraryId],
    ([libraryId]) => server.getLibraryAreasMapUrl(libraryId),
    {
      refreshInterval:
        cache.LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
    },
  )
  return {
    libraryAreasMapUrl: data,
    error: error,
  }
}

export { useLibraryAvailability, useLibraryAreasMapUrl }
