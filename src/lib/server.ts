"use server"

import * as service from "@/lib/service"
import * as cache from "@/lib/cache"
import { LibraryId } from "./types"

const cacheLibraryInfo = cache.cacheLibraryInfo(
  () => service.getLibraryInfo(),
  cache.LIBRARY_INFO_CACHE_DURATION_MS,
)

function getLibraryInfo() {
  return cacheLibraryInfo().strict()
}

const cacheLibraryAvailability = cache.cacheLibraryAvailability(
  async (libraryId, date) =>
    service.getLibraryAvailability(
      await getLibraryInfo(),
      libraryId,
      date,
    ),
  cache.LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
)

function getLibraryAvailability(
  libraryId: LibraryId,
  date: Date,
) {
  return cacheLibraryAvailability(libraryId, date).strict()
}

const cacheLibraryAreasMapUrl = cache.cacheLibraryAreasMapUrl(
  async (libraryId) => {
    const libraryInfo = await getLibraryInfo()
    const libraryDetails = libraryInfo.get(libraryId)!
    const areaInfo = libraryDetails.areaInfo
    return service.getLibraryAreasMapUrl(libraryId, areaInfo)
  },
  cache.LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
)

function getLibraryAreasMapUrl(libraryId: LibraryId) {
  return cacheLibraryAreasMapUrl(libraryId).strict()
}

export {
  getLibraryInfo,
  getLibraryAvailability,
  getLibraryAreasMapUrl,
}
