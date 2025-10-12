/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  LibraryId,
  LibraryInfo,
  LibraryDetails,
  AreaInfo,
  AreaDetails,
  SeatInfo,
  SeatDetails,
  AreaId,
  SeatId,
  LibraryAvailability,
  AreaAvailability,
  SeatAvailability,
  DatedAreaAvailability,
} from "@/lib/types.ts"
import {
  addDays,
  diffLocalDays,
  getLocalHours,
  maxDate,
  minDate,
  parseLocalISOHHmm,
  roundUpQuarterHour,
  setLocalHHmm,
  formatLocalDate,
} from "./date-utils"

const API_URL = "https://www.nlb.gov.sg/seatbooking/api"
const API_URL_GET_ACCOUNT_INFO =
  API_URL + "/accounts/GetAccountInfo"
const API_URL_SEARCH_AVAILABLE_AREAS =
  API_URL + "/areas/SearchAvailableAreas"
const API_HEADERS = { referer: "https://www.nlb.gov.sg/" }

const AREA_MAP_IMAGE_URL =
  "https://www.nlb.gov.sg/seatbooking/img/areas/"

const BOOKING_TIMESLOT_IN_MINUTES = 15
const MIN_BOOKING_DURATION_IN_MINUTES = 30
const BOOKING_TIMESLOT_IN_MILLISECONDS =
  BOOKING_TIMESLOT_IN_MINUTES * 60 * 1000

async function apiGetAccountInfo(): Promise<any> {
  const response = await fetch(API_URL_GET_ACCOUNT_INFO, {
    headers: API_HEADERS,
  })
  const data = await response.json()
  return data
}

async function apiSearchAvailableAreas(
  libraryId: LibraryId,
  startDatetime: Date,
  durationInMinutes: number,
  areaId: AreaId | null = null,
): Promise<any> {
  const params = new URLSearchParams({
    Mode: "OffsiteMode",
    BranchId: libraryId.toString(),
    AreaId: areaId !== null ? areaId.toString() : "",
    StartTime: formatLocalDate(
      startDatetime,
      "yyyy-MM-dd'T'HH:mm",
    ),
    DurationInMinutes: durationInMinutes.toString(),
  })
  const url =
    API_URL_SEARCH_AVAILABLE_AREAS + "?" + params.toString()
  const response = await fetch(url, { headers: API_HEADERS })
  const data = await response.json()
  return data
}

async function getLibraryInfo(): Promise<LibraryInfo> {
  console.log(
    "%s service.getLibraryInfo()",
    new Date().toLocaleString(),
  )

  const accountInfo = await apiGetAccountInfo()
  const menus = accountInfo["settings"]["menus"]
  const branchMenus = menus["branchMenus"]

  function parseLibraryInfo(branchMenus: any[]): LibraryInfo {
    return new Map(
      branchMenus.map((branch) => {
        const libraryId = branch["id"]
        const libraryDetails = parseLibraryDetails(branch)
        return [libraryId, libraryDetails]
      }),
    )
  }
  function parseLibraryDetails(branch: any): LibraryDetails {
    return {
      name: branch["name"],
      areaInfo: parseAreaInfo(branch["areas"]),
    }
  }
  function parseAreaInfo(areas: any[]): AreaInfo {
    return new Map(
      areas.map((area) => {
        const areaId = area["id"]
        const areaDetails = parseAreaDetails(area)
        return [areaId, areaDetails]
      }),
    )
  }
  function parseAreaDetails(area: any): AreaDetails {
    return {
      name: area["name"],
      openingTime: parseLocalISOHHmm(area["openingTime"]),
      closingTime: parseLocalISOHHmm(area["closingTime"]),
      seatInfo: parseSeatInfo(area["seats"]),
    }
  }
  function parseSeatInfo(seats: any[]): SeatInfo {
    return new Map(
      seats.map((seat) => {
        const seatId = seat["id"]
        const seatDetails = parseSeatDetails(seat)
        return [seatId, seatDetails]
      }),
    )
  }
  function parseSeatDetails(seat: any): SeatDetails {
    return { name: seat["name"] }
  }

  function filterBranchMenus(branchMenus: any[]): any[] {
    return branchMenus.filter(
      (branch) => branch["areas"].length > 0,
    )
  }

  return parseLibraryInfo(filterBranchMenus(branchMenus))
}

async function searchAvailableAreas(
  libraryId: LibraryId,
  startDatetime: Date,
  durationInMinutes: number,
): Promise<Map<AreaId, SeatId[]>> {
  const data = await apiSearchAvailableAreas(
    libraryId,
    startDatetime,
    durationInMinutes,
  )

  if (!data["found"]) return new Map()

  return new Map(
    data["areas"].map((area: any) => {
      const areaId = area["areaId"]
      const seatIds = area["availableSeats"].map(
        (seat: any) => seat["id"],
      )
      return [areaId, seatIds]
    }),
  )
}

async function getAreaMapUrl(
  libraryId: LibraryId,
  areaId: AreaId,
  areaDetails: AreaDetails,
): Promise<[string, string] | null> {
  const openingTime = areaDetails.openingTime
  const closingTime = areaDetails.closingTime
  const now = new Date()
  const today = setLocalHHmm(now, "0000")
  const tomorrow = addDays(today, 1)
  const todayOpening = setLocalHHmm(today, openingTime)
  const todayClosing = setLocalHHmm(today, closingTime)
  const tomorrowOpening = setLocalHHmm(tomorrow, openingTime)
  const todayDatetime =
    todayClosing <= now ? null : maxDate(todayOpening, now)
  const tomorrowDatetime =
    getLocalHours(now) < 12 ? null : tomorrowOpening

  async function query(
    datetime: Date,
  ): Promise<[string, string] | null> {
    const data = await apiSearchAvailableAreas(
      libraryId,
      datetime,
      MIN_BOOKING_DURATION_IN_MINUTES,
      areaId,
    )
    const areas: any[] = data["areas"]
    const area: any = areas
      .values()
      .filter((a) => a["areaId"] == areaId)
      .next().value
    return area && area["areaMapUrls"]
  }
  const data =
    (todayDatetime && (await query(todayDatetime))) ||
    (tomorrowDatetime && (await query(tomorrowDatetime)))
  return data
}

async function getLibraryAreasMapUrl(
  libraryId: LibraryId,
  areaInfo: AreaInfo,
): Promise<Map<AreaId, [string, string] | null>> {
  console.log(
    "%s service.getLibraryAreasMapUrl(%d, ...)",
    new Date().toLocaleString(),
    libraryId,
  )
  return new Map(
    await Promise.all<[AreaId, [string, string] | null]>(
      areaInfo
        .entries()
        .map(
          async ([areaId, areaDetails]): Promise<
            [AreaId, [string, string] | null]
          > => [
            areaId,
            await getAreaMapUrl(libraryId, areaId, areaDetails),
          ],
        ),
    ),
  )
}

function getAreaMapImageUrl(areaMapUrl: [string, string]) {
  return [
    AREA_MAP_IMAGE_URL + areaMapUrl[0],
    AREA_MAP_IMAGE_URL + areaMapUrl[1],
  ]
}

function getTimeslotIndex(
  startDatetime: Date,
  datetime: Date,
): number {
  return Math.floor(
    (datetime.getTime() - startDatetime.getTime()) /
      BOOKING_TIMESLOT_IN_MILLISECONDS,
  )
}

function getNumberOfTimeslots(
  startDatetime: Date,
  endDatetime: Date,
): number {
  return Math.ceil(
    (endDatetime.getTime() - startDatetime.getTime()) /
      BOOKING_TIMESLOT_IN_MILLISECONDS,
  )
}

function getTimeslots(
  startDatetime: Date,
  endDatetime: Date,
): Date[] {
  const numberOfTimeslots = getNumberOfTimeslots(
    startDatetime,
    endDatetime,
  )
  return Array.from(
    { length: numberOfTimeslots },
    (_, i) => i,
  ).map(
    (i: number) =>
      new Date(
        startDatetime.getTime() +
          i * BOOKING_TIMESLOT_IN_MILLISECONDS,
      ),
  )
}

async function getLibraryAvailability(
  libraryInfo: LibraryInfo,
  libraryId: LibraryId,
  date: Date,
): Promise<LibraryAvailability> {
  console.log(
    "%s service.getLibraryAvailability(%d, %s)",
    new Date().toLocaleString(),
    libraryId,
    date.toLocaleString(),
  )

  const now = new Date()
  const daysDiff = diffLocalDays(date, now)
  if (!(0 <= daysDiff && daysDiff <= 1)) throw new Error()

  const libraryDetails = libraryInfo.get(libraryId)
  // TODO: remove all ! throw new Error()
  if (!libraryDetails) throw new Error()
  const areaInfo = libraryDetails.areaInfo

  function getEndDatetime(): Date {
    const closingDatetimes = areaInfo
      .values()
      .map((a) => setLocalHHmm(date, a.closingTime))
    return maxDate(...closingDatetimes)
  }

  const endDatetime = getEndDatetime()

  function getStartDatetime(): Date {
    const openingDatetimes = areaInfo
      .values()
      .map((a) => setLocalHHmm(date, a.openingTime))
    const startDatetime = minDate(...openingDatetimes)
    const quarterNow = roundUpQuarterHour(now)
    const clip = (a: Date, b: Date, c: Date) =>
      maxDate(a, minDate(b, c))
    return clip(startDatetime, quarterNow, endDatetime)
  }

  const startDatetime = getStartDatetime()

  const timeslots: Date[] = getTimeslots(
    startDatetime,
    endDatetime,
  )

  function initLibraryAvailability(): LibraryAvailability {
    return new Map(
      Array.from(areaInfo.entries()).map(
        ([areaId, areaDetails]) => [
          areaId,
          initDatedAreaAvailability(areaDetails),
        ],
      ),
    )
  }
  function initDatedAreaAvailability(
    areaDetails: AreaDetails,
  ): DatedAreaAvailability {
    const openingTime = areaDetails.openingTime
    const closingTime = areaDetails.closingTime
    const openingDatetime = setLocalHHmm(date, openingTime)
    const closingDatetime = setLocalHHmm(date, closingTime)
    const areaStartDatetime = maxDate(
      openingDatetime,
      startDatetime,
    )
    const areaEndDatetime = closingDatetime
    const numberOfTimeslots = getNumberOfTimeslots(
      areaStartDatetime,
      areaEndDatetime,
    )
    return {
      startDatetime: areaStartDatetime,
      endDatetime: areaEndDatetime,
      areaAvailability: initAreaAvailability(
        areaDetails.seatInfo.keys(),
        numberOfTimeslots,
      ),
    }
  }
  function initAreaAvailability(
    seatIds: Iterable<SeatId>,
    numberOfTimeslots: number,
  ): AreaAvailability {
    return new Map(
      Array.from(seatIds).map((seatId) => [
        seatId,
        initSeatAvailability(numberOfTimeslots),
      ]),
    )
  }
  function initSeatAvailability(numberOfTimeslots: number) {
    return Array(numberOfTimeslots).fill(false)
  }

  function updateLibraryAvailabilty(
    libraryAvailability: LibraryAvailability,
    timeslot: Date,
    availableAreas: Map<AreaId, SeatId[]>,
  ): void {
    for (const [areaId, seatIds] of availableAreas) {
      const areaDetails = areaInfo.get(areaId)
      const areaAvailability = libraryAvailability.get(areaId)
      if (!areaDetails) throw new Error()
      if (!areaAvailability) throw new Error()

      updateDatedAreaAvailability(
        areaAvailability,
        timeslot,
        seatIds,
      )
    }
  }
  function updateDatedAreaAvailability(
    {
      startDatetime: areaStartDatetime,
      areaAvailability,
    }: DatedAreaAvailability,
    timeslot: Date,
    seatIds: SeatId[],
  ): void {
    const timeslotIndex = getTimeslotIndex(
      areaStartDatetime,
      timeslot,
    )
    updateAreaAvailability(
      areaAvailability,
      timeslotIndex,
      seatIds,
    )
  }
  function updateAreaAvailability(
    areaAvailability: AreaAvailability,
    timeslotIndex: number,
    seatIds: SeatId[],
  ) {
    for (const seatId of seatIds) {
      const seatAvailability = areaAvailability.get(seatId)
      if (!seatAvailability) throw new Error()

      updateSeatAvailability(seatAvailability, timeslotIndex)
    }
  }
  function updateSeatAvailability(
    seatAvailability: SeatAvailability,
    timeslotIndex: number,
  ): void {
    seatAvailability[timeslotIndex] = true
    if (timeslotIndex + 1 < seatAvailability.length)
      seatAvailability[timeslotIndex + 1] = true
  }

  const libraryAvailability = initLibraryAvailability()

  const searches: Promise<Map<AreaId, SeatId[]>>[] =
    timeslots.map((timeslot) =>
      searchAvailableAreas(
        libraryId,
        timeslot,
        MIN_BOOKING_DURATION_IN_MINUTES,
      ),
    )

  for (let i = 0; i < timeslots.length; i++) {
    const timeslot = timeslots[i]
    const availableAreas = await searches[i]
    if (!timeslot) throw new Error()
    if (!availableAreas) throw new Error()
    updateLibraryAvailabilty(
      libraryAvailability,
      timeslot,
      availableAreas,
    )
  }

  return libraryAvailability
}

export {
  getLibraryInfo,
  getLibraryAvailability,
  getTimeslots,
  getLibraryAreasMapUrl,
  getAreaMapImageUrl,
}

export {
  apiGetAccountInfo,
  apiSearchAvailableAreas,
  getTimeslotIndex,
  getNumberOfTimeslots,
  getAreaMapUrl,
}
