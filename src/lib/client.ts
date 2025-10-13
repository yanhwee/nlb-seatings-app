"use client"

import * as server from "@/lib/server"
import { AreaId, LibraryAvailability, LibraryId } from "./types"
import {
  makeGetLibraryAreasMapUrlCoalesce,
  makeGetLibraryAvailiabilityCoalesce,
} from "./coalesce"
import {
  LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  makeLibraryAreasMapUrlTimedCachedFn,
  makeLibraryAvailabilityTimedCachedFn,
  Time,
  Timestamp,
} from "./cache"
import { useTimedCachedFn } from "./cache-react"

/* Library Availability */

const getLibraryAvailabilityCoalesce =
  makeGetLibraryAvailiabilityCoalesce<
    Timestamp<LibraryAvailability>
  >()

const serverGetTimedLibraryAvailability =
  getLibraryAvailabilityCoalesce(
    server.getTimedLibraryAvailability,
  )

const libraryAvailabilityTimedCachedFn =
  makeLibraryAvailabilityTimedCachedFn(
    serverGetTimedLibraryAvailability,
  )

const libraryAvailabilityTimedCachedFn_ = (() => {
  const fn = libraryAvailabilityTimedCachedFn
  const { cache, update } = fn
  const wrap =
    <V>(fn: (k: [LibraryId, Date]) => V) =>
    ([libraryId, time]: [LibraryId, Time]) =>
      fn([libraryId, new Date(time)])
  return {
    cache: wrap(cache),
    update: wrap(update),
  }
})()

const useLibraryAvailability = (
  libraryId: LibraryId,
  date: Date,
) =>
  useTimedCachedFn(
    libraryAvailabilityTimedCachedFn_,
    [libraryId, date.getTime()],
    LIBRARY_AVAILABILITY_CACHE_DURATION_MS,
  )

/* Library Areas Map Url */

const getLibraryAreasMapUrlCoalesce =
  makeGetLibraryAreasMapUrlCoalesce<
    Timestamp<Map<AreaId, [string, string] | null>>
  >()

const serverGetTimedLibraryAreasMapUrl =
  getLibraryAreasMapUrlCoalesce(
    server.getTimedLibraryAreasMapUrl,
  )

const libraryAreasMapUrlTimedCachedFn =
  makeLibraryAreasMapUrlTimedCachedFn(
    serverGetTimedLibraryAreasMapUrl,
  )

const useLibraryAreasMapUrl = (libraryId: LibraryId) =>
  useTimedCachedFn(
    libraryAreasMapUrlTimedCachedFn,
    [libraryId],
    LIBRARY_AREAS_MAP_URL_CACHE_DURATION_MS,
  )

export { useLibraryAvailability, useLibraryAreasMapUrl }
