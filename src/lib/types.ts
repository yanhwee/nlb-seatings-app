type LibraryId = number
type AreaId = number
type SeatId = number

type LibraryInfo = Map<LibraryId, LibraryDetails>
type AreaInfo = Map<AreaId, AreaDetails>
type SeatInfo = Map<SeatId, SeatDetails>

type LibraryDetails = {
  name: string
  areaInfo: AreaInfo
}
type AreaDetails = {
  name: string
  openingTime: string // 24h format HHmm
  closingTime: string
  seatInfo: SeatInfo
}
type SeatDetails = {
  name: string
}

type LibraryAvailability = Map<AreaId, DatedAreaAvailability>
type DatedAreaAvailability = {
  startDatetime: Date
  endDatetime: Date
  areaAvailability: AreaAvailability
}
type AreaAvailability = Map<SeatId, SeatAvailability>
type SeatAvailability = boolean[]

export type {
  LibraryId,
  AreaId,
  SeatId,
  LibraryInfo,
  AreaInfo,
  SeatInfo,
  LibraryDetails,
  AreaDetails,
  SeatDetails,
  LibraryAvailability,
  DatedAreaAvailability,
  AreaAvailability,
  SeatAvailability,
}
