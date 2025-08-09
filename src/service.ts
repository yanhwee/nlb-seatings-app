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
  DatedLibraryAvailability,
  LibraryAvailability,
  AreaAvailability,
  SeatAvailability,
} from "./types.js"
import { toLocalISOString } from "./utils.js"
import axios from "axios"

const API_URL_GET_ACCOUNT_INFO =
  "https://www.nlb.gov.sg/seatbooking/api/accounts/GetAccountInfo"
const API_URL_SEARCH_AVAILABLE_AREAS =
  "https://www.nlb.gov.sg/seatbooking/api/areas/SearchAvailableAreas"
const API_HEADERS = { referer: "https://www.nlb.gov.sg/" }

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
): Promise<any> {
  const response = await axios.get(API_URL_SEARCH_AVAILABLE_AREAS, {
    headers: API_HEADERS,
    params: {
      Mode: "OffsiteMode",
      BranchId: libraryId,
      StartTime: toLocalISOString(startDatetime),
      DurationInMinutes: durationInMinutes,
    },
  })
  return response.data
}

async function getLibraryInfo(): Promise<LibraryInfo> {
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
      openingTime: new Date(area["openingTime"]),
      closingTime: new Date(area["closingTime"]),
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
    return branchMenus.filter((branch) => branch["areas"].length > 0)
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

async function getDatedLibraryAvailability(
  libraryId: LibraryId,
  date: Date,
): Promise<DatedLibraryAvailability> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() < today.getTime()) throw new Error()

  const libraryInfo = await getLibraryInfo()
  const libraryDetails = libraryInfo.get(libraryId)
  if (!libraryDetails) throw new Error()
  const areaInfo = libraryDetails.areaInfo

  function getRoundedQuarterHour(): Date {
    const now = new Date()
    const minutesToAdd =
      BOOKING_TIMESLOT_IN_MINUTES -
      (now.getMinutes() % BOOKING_TIMESLOT_IN_MINUTES)
    now.setMinutes(now.getMinutes() + minutesToAdd, 0, 0)
    return now
  }
  function getOpeningDatetime(): Date {
    const openingTimes = Array.from(areaInfo.values()).map(
      (areaDetails) => areaDetails.openingTime,
    )
    const minOpeningTime = new Date(
      Math.min(...openingTimes.map((t) => t.getTime())),
    )
    const openingDatetime = new Date(minOpeningTime)
    openingDatetime.setFullYear(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )
    if (date.getTime() === today.getTime())
      return getRoundedQuarterHour()
    return openingDatetime
  }
  function getClosingDatetime(): Date {
    const closingTimes = Array.from(areaInfo.values()).map(
      (areaDetails) => areaDetails.closingTime,
    )
    const maxClosingTime = new Date(
      Math.max(...closingTimes.map((t) => t.getTime())),
    )
    const closingDatetime = new Date(maxClosingTime)
    closingDatetime.setFullYear(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )
    return closingDatetime
  }

  const openingDatetime = getOpeningDatetime()
  const closingDatetime = getClosingDatetime()

  function getNumberOfTimeslots(
    startTime: Date,
    endTime: Date,
  ): number {
    return Math.floor(
      (endTime.getTime() - startTime.getTime()) /
        BOOKING_TIMESLOT_IN_MILLISECONDS,
    )
  }
  function getTimeslots(): Date[] {
    const numberOfTimeslots = getNumberOfTimeslots(
      openingDatetime,
      closingDatetime,
    )
    return Array.from({ length: numberOfTimeslots }, (_, i) => i).map(
      (i: number) =>
        new Date(
          openingDatetime.getTime() +
            i * BOOKING_TIMESLOT_IN_MILLISECONDS,
        ),
    )
  }

  const timeslots: Date[] = getTimeslots()

  function initLibraryAvailability(): LibraryAvailability {
    const initTimeslots = (areaDetails: AreaDetails) =>
      Array(
        getNumberOfTimeslots(
          areaDetails.openingTime,
          areaDetails.closingTime,
        ),
      ).fill(false)

    return new Map(
      Array.from(areaInfo.entries()).map(([areaId, areaDetails]) => [
        areaId,
        new Map(
          Array.from(areaDetails.seatInfo.keys()).map((seatId) => [
            seatId,
            initTimeslots(areaDetails),
          ]),
        ),
      ]),
    )
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

      const areaOpeningTime = areaDetails.openingTime
      areaOpeningTime.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      )

      const seatAvailabilityIndex = Math.floor(
        (timeslot.getTime() - areaOpeningTime.getTime()) /
          BOOKING_TIMESLOT_IN_MILLISECONDS,
      )

      updateAreaAvailability(
        areaAvailability,
        seatAvailabilityIndex,
        seatIds,
      )
    }
  }
  function updateAreaAvailability(
    areaAvailability: AreaAvailability,
    seatAvailabilityIndex: number,
    seatIds: SeatId[],
  ): void {
    for (const seatId of seatIds) {
      const seatAvailability = areaAvailability.get(seatId)
      if (!seatAvailability) throw new Error()

      updateSeatAvailability(seatAvailability, seatAvailabilityIndex)
    }
  }
  function updateSeatAvailability(
    seatAvailability: SeatAvailability,
    seatAvailabilityIndex: number,
  ): void {
    seatAvailability[seatAvailabilityIndex] = true
    if (seatAvailabilityIndex + 1 < seatAvailability.length)
      seatAvailability[seatAvailabilityIndex + 1] = true
  }

  const libraryAvailability = initLibraryAvailability()

  const searches: Promise<Map<AreaId, SeatId[]>>[] = timeslots.map(
    (timeslot) =>
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

  return [openingDatetime, libraryAvailability]
}

export { getLibraryInfo, getDatedLibraryAvailability }
