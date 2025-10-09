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
import { setDate, toLocalISOString } from "@/lib/utils"
import axios from "axios"

const API_URL = "https://www.nlb.gov.sg/seatbooking/api"
const API_URL_GET_ACCOUNT_INFO =
  API_URL + "/accounts/GetAccountInfo"
const API_URL_SEARCH_AVAILABLE_AREAS =
  API_URL + "/areas/SearchAvailableAreas"
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
  const response = await axios.get(
    API_URL_SEARCH_AVAILABLE_AREAS,
    {
      headers: API_HEADERS,
      params: {
        Mode: "OffsiteMode",
        BranchId: libraryId,
        StartTime: toLocalISOString(startDatetime),
        DurationInMinutes: durationInMinutes,
      },
    },
  )
  return response.data
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

  date.setHours(0, 0, 0, 0)

  function checkDate() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return (
      today.getTime() <= date.getTime() &&
      date.getTime() <= tomorrow.getTime()
    )
  }

  if (!checkDate()) throw new Error()

  const libraryDetails = libraryInfo.get(libraryId)
  if (!libraryDetails) throw new Error()
  const areaInfo = libraryDetails.areaInfo

  function getEndDatetime(): Date {
    const closingTimes = Array.from(areaInfo.values()).map(
      (areaDetails) => areaDetails.closingTime,
    )
    const maxClosingTime = new Date(
      Math.max(...closingTimes.map((t) => t.getTime())),
    )
    const endDatetime = new Date(maxClosingTime)
    setDate(endDatetime, date)
    return endDatetime
  }

  const endDatetime = getEndDatetime()

  function getRoundedQuarterHour(): Date {
    const now = new Date()
    const minutesToAdd =
      BOOKING_TIMESLOT_IN_MINUTES -
      (now.getMinutes() % BOOKING_TIMESLOT_IN_MINUTES)
    now.setMinutes(now.getMinutes() + minutesToAdd, 0, 0)
    return now
  }
  function getStartDatetime(): Date {
    const openingTimes = Array.from(areaInfo.values()).map(
      (areaDetails) => areaDetails.openingTime,
    )
    const minOpeningTime = new Date(
      Math.min(...openingTimes.map((t) => t.getTime())),
    )
    const startDatetime = new Date(minOpeningTime)
    setDate(startDatetime, date)
    const quarterHour = getRoundedQuarterHour()
    if (quarterHour.getTime() > endDatetime.getTime())
      return endDatetime
    if (quarterHour.getTime() > startDatetime.getTime())
      return quarterHour
    return startDatetime
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
    const areaOpeningDatetime = new Date(
      areaDetails.openingTime,
    )
    const areaClosingDatetime = new Date(
      areaDetails.closingTime,
    )
    setDate(areaOpeningDatetime, date)
    setDate(areaClosingDatetime, date)
    const areaStartDatetime =
      startDatetime > areaOpeningDatetime
        ? startDatetime
        : areaOpeningDatetime
    const numberOfTimeslots = getNumberOfTimeslots(
      areaStartDatetime,
      areaClosingDatetime,
    )
    return {
      startDatetime: areaStartDatetime,
      endDatetime: areaClosingDatetime,
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
  getNumberOfTimeslots,
  getTimeslots,
}
