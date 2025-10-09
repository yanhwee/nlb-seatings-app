"use server"

import * as service from "@/lib/service"
import * as cache from "@/lib/cache"

const cacheLibraryInfo = cache.cacheLibraryInfo(
  () => service.getLibraryInfo(),
  10 * 60 * 1000,
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
  10 * 60 * 1000,
)

function getLibraryAvailability(libraryId: number, date: Date) {
  return cacheLibraryAvailability(libraryId, date).strict()
}

export { getLibraryInfo, getLibraryAvailability }
