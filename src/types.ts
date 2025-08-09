type LibraryId = number;
type AreaId = number;
type SeatId = number;

type LibraryInfo = Map<LibraryId, LibraryDetails>;
type AreaInfo = Map<AreaId, AreaDetails>;
type SeatInfo = Map<SeatId, SeatDetails>;

type LibraryDetails = {
    name: string;
    areaInfo: AreaInfo;
}
type AreaDetails = {
    name: string;
    openingTime: Date;
    closingTime: Date;
    seatInfo: SeatInfo;
}
type SeatDetails = {
    name: string;
}

type LibraryAvailability = Map<AreaId, AreaAvailability>;
type AreaAvailability = Map<SeatId, SeatAvailability>;
type SeatAvailability = boolean[];

type DatedLibraryAvailability = [Date, LibraryAvailability];

export type {
    LibraryId, AreaId, SeatId,
    LibraryInfo, AreaInfo, SeatInfo,
    LibraryDetails, AreaDetails, SeatDetails,
    LibraryAvailability, AreaAvailability, SeatAvailability,
    DatedLibraryAvailability
};
