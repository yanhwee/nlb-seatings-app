import React, { useState } from "react"
import "./App.css"
import {
  cachedLibraryAvailability,
  cachedLibraryInfo,
} from "./cache"
import { getTimeslots } from "./service"
import { isFullHour, isSameDay } from "./utils"
import type {
  AreaDetails,
  AreaId,
  AreaInfo,
  DatedAreaAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"

interface AreaAvailabilityTableProps {
  areaDetails: AreaDetails
  datedAreaAvailability: DatedAreaAvailability
}

function AreaAvailabilityTable({
  areaDetails,
  datedAreaAvailability,
}: AreaAvailabilityTableProps) {
  const { startDatetime, endDatetime, areaAvailability } =
    datedAreaAvailability
  const timeslots = getTimeslots(startDatetime, endDatetime)
  const seatInfo = areaDetails.seatInfo
  const numberOfTimeslots = timeslots.length
  const numberOfSeats = areaAvailability.size
  const cellWidth = 20
  const cellHeight = 30
  return (
    <div
      id="area-availability-table"
      className="area-availability-table"
      style={{
        gridTemplateColumns:
          "max-content " +
          `repeat(${numberOfTimeslots}, ${cellWidth}px)`,
        gridTemplateRows:
          "max-content " +
          `repeat(${numberOfSeats}, ${cellHeight}px)`,
      }}
    >
      <div className="area-availability-table__top-left-cell">
        {/* top left cell */}
      </div>

      {/* timeslot header */}
      {timeslots.map((timeslot, timeslotIndex) => (
        <div
          key={timeslotIndex}
          className="area-availability-table__time-header"
        >
          <div className="area-availability-table__time-header-label">
            {isFullHour(timeslot)
              ? timeslot.getHours() % 12
              : ""}
          </div>
        </div>
      ))}

      {Array.from(areaAvailability.entries()).map(
        ([seatId, seatAvailability]) => {
          const seatDetails = seatInfo.get(seatId)
          if (!seatDetails) throw new Error()
          const seatName = seatDetails.name
          return (
            <React.Fragment key={seatId}>
              {/* seat name header */}
              <div className="area-availability-table__seat-header">
                {seatName}
              </div>

              {/* availability cells */}
              {seatAvailability.map((isAvailable, index) => (
                <div
                  key={index}
                  className={
                    "area-availability-table__cell" +
                    " area-availability-table__cell--" +
                    (isAvailable ? "available" : "reserved") +
                    (isFullHour(timeslots[index])
                      ? " area-availability-table__cell--hour"
                      : "")
                  }
                ></div>
              ))}
            </React.Fragment>
          )
        },
      )}
    </div>
  )
}

interface SelectLibraryProps {
  libraryInfo: LibraryInfo
  selectedLibraryId: LibraryId
  handleSelectLibraryId: (libraryId: LibraryId) => void
}

function SelectLibrary({
  libraryInfo,
  selectedLibraryId: libraryId,
  handleSelectLibraryId: setLibraryId,
}: SelectLibraryProps) {
  return (
    <fieldset>
      <legend>Library</legend>
      <select
        value={libraryId}
        onChange={(e) => setLibraryId(parseInt(e.target.value))}
      >
        {Array.from(libraryInfo.entries()).map(
          ([libraryId, libraryDetails]) => (
            <option key={libraryId} value={libraryId}>
              {libraryDetails.name}
            </option>
          ),
        )}
      </select>
    </fieldset>
  )
}

interface SelectAreaProps {
  areaInfo: AreaInfo
  selectedAreaId: AreaId
  handleSelectAreaId: (areaId: AreaId) => void
}

function SelectArea({
  areaInfo,
  selectedAreaId: areaId,
  handleSelectAreaId: setAreaId,
}: SelectAreaProps) {
  return (
    <fieldset>
      <legend>Area</legend>
      <select
        value={areaId}
        onChange={(e) => setAreaId(parseInt(e.target.value))}
      >
        {Array.from(areaInfo.entries()).map(
          ([areaId, areaDetails]) => (
            <option key={areaId} value={areaId}>
              {areaDetails.name}
            </option>
          ),
        )}
      </select>
    </fieldset>
  )
}

interface SelectDateProps {
  selectedDate: Date
  handleSelectDate: (date: Date) => void
}

function SelectDate({
  selectedDate,
  handleSelectDate,
}: SelectDateProps) {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    <fieldset>
      <legend>Date</legend>
      <label>
        <input
          type="radio"
          checked={isSameDay(selectedDate, today)}
          onChange={(e) => handleSelectDate(today)}
        />
        {today.toDateString()}
      </label>
      <label>
        <input
          type="radio"
          checked={isSameDay(selectedDate, tomorrow)}
          onChange={(e) => handleSelectDate(tomorrow)}
        />
        {tomorrow.toDateString()}
      </label>
    </fieldset>
  )
}

function App() {
  const libraryInfo = cachedLibraryInfo

  let defaultLibraryId = libraryInfo.keys().next().value
  if (!defaultLibraryId) throw new Error()
  defaultLibraryId = 31

  const [libraryId, setLibraryId] =
    useState<LibraryId>(defaultLibraryId)

  const libraryDetails = libraryInfo.get(libraryId)
  if (!libraryDetails) throw new Error()
  const areaInfo = libraryDetails.areaInfo

  const defaultAreaId = areaInfo.keys().next().value
  if (!defaultAreaId) throw new Error()

  const [areaId, setAreaId] = useState<AreaId>(defaultAreaId)

  function handleSelectLibraryId(libraryId: LibraryId) {
    const libraryDetails = libraryInfo.get(libraryId)
    if (!libraryDetails) throw new Error()
    const areaInfo = libraryDetails.areaInfo
    const areaId = areaInfo.keys().next().value
    if (!areaId) throw new Error()
    setLibraryId(libraryId)
    setAreaId(areaId)
  }

  const [date, setDate] = useState<Date>(new Date())

  const libraryAvailability = cachedLibraryAvailability
  const datedAreaAvailability = libraryAvailability.get(areaId)
  const areaDetails = libraryInfo.get(31)?.areaInfo.get(areaId)
  if (!datedAreaAvailability) throw new Error()
  if (!areaDetails) throw new Error()

  return (
    <>
      <SelectLibrary
        libraryInfo={libraryInfo}
        selectedLibraryId={libraryId}
        handleSelectLibraryId={handleSelectLibraryId}
      />
      <SelectArea
        areaInfo={areaInfo}
        selectedAreaId={areaId}
        handleSelectAreaId={setAreaId}
      />
      <SelectDate
        selectedDate={date}
        handleSelectDate={setDate}
      />
      <AreaAvailabilityTable
        areaDetails={areaDetails}
        datedAreaAvailability={datedAreaAvailability}
      />
    </>
  )
}

export default App
