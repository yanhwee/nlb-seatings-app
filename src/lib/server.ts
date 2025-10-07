"use server"

import {
  LibraryAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"
import * as service from "./service"
import { isToday, isTomorrow } from "./utils"

const CACHE_DURATION_MS = 5 * 60 * 1000 // 1 minute

type Cached<T> =
  | { state: "promise"; promise: Promise<T> }
  | { state: "resolved"; value: T; timestamp: number }
  | null

let cachedLibraryInfo: Cached<LibraryInfo> = null

async function getLibraryInfo(): Promise<LibraryInfo> {
  if (cachedLibraryInfo?.state === "promise") {
    return cachedLibraryInfo.promise
  }
  if (cachedLibraryInfo?.state === "resolved") {
    const elapsed = Date.now() - cachedLibraryInfo.timestamp
    if (elapsed < CACHE_DURATION_MS) {
      return cachedLibraryInfo.value
    }
  }
  console.log("Server: Fetching library info")
  const promise = service
    .getLibraryInfo()
    .then((libraryInfo) => {
      cachedLibraryInfo = {
        state: "resolved",
        value: libraryInfo,
        timestamp: Date.now(),
      }
      return libraryInfo
    })
  cachedLibraryInfo = { state: "promise", promise }
  return promise
}

enum Day {
  Today,
  Tomorrow,
}

const cachedLibraryAvailabilities: Map<
  Day,
  Map<LibraryId, Cached<LibraryAvailability>>
> = new Map([
  [Day.Today, new Map()],
  [Day.Tomorrow, new Map()],
])

async function getLibraryAvailability(
  libraryId: LibraryId,
  date: Date,
): Promise<LibraryAvailability> {
  const day = isToday(date)
    ? Day.Today
    : isTomorrow(date)
      ? Day.Tomorrow
      : null
  if (day === null) throw new Error()
  const libraryAvailability = cachedLibraryAvailabilities
    .get(day)!
    .get(libraryId)
  if (libraryAvailability?.state === "promise") {
    return libraryAvailability.promise
  }
  if (libraryAvailability?.state === "resolved") {
    const elapsed = Date.now() - libraryAvailability.timestamp
    if (elapsed < CACHE_DURATION_MS) {
      return libraryAvailability.value
    }
  }
  console.log(
    "Server: Fetching dated area availability for libraryId:",
    libraryId,
    "date:",
    date,
  )
  const promise = getLibraryInfo().then(async (libraryInfo) => {
    const libraryAvailability =
      await service.getLibraryAvailability(
        libraryInfo,
        libraryId,
        date,
      )
    cachedLibraryAvailabilities.get(day)!.set(libraryId, {
      state: "resolved",
      value: libraryAvailability,
      timestamp: Date.now(),
    })
    return libraryAvailability
  })
  cachedLibraryAvailabilities
    .get(day)!
    .set(libraryId, { state: "promise", promise })
  return promise
}

export { getLibraryInfo, getLibraryAvailability }
