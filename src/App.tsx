import React, { useState } from "react"
import "./App.css"
import {
  cachedLibraryAvailability,
  cachedLibraryInfo,
} from "./cache"
import { getTimeslots } from "./service"
import { formatDate, isFullHour, isSameDay } from "./utils"
import type {
  AreaDetails,
  AreaId,
  AreaInfo,
  DatedAreaAvailability,
  LibraryId,
  LibraryInfo,
} from "./types"
import {
  FiBookOpen,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi"

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

  const cellWidthPx = 5
  const cellHeightPx = 24
  return (
    <table
      id="area-availability-table"
      className="area-availability-table"
    >
      <thead>
        <tr>
          <th className="area-availability-table__top-left-cell"></th>
          {timeslots.map((timeslot, index) => (
            <th
              key={index}
              className="area-availability-table__time-label-cell"
              style={{ minWidth: `${cellWidthPx}px` }}
            >
              <div className="area-availability-table__time-label">
                {isFullHour(timeslot)
                  ? timeslot.getHours()
                  : ""}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from(areaAvailability.entries()).map(
          ([seatId, seatAvailability]) => (
            <tr>
              <th
                className="area-availability-table__seat-label-cell"
                style={{ height: `${cellHeightPx}px` }}
              >
                {seatInfo.get(seatId)?.name}
              </th>
              {seatAvailability.map((isAvailable, index) => (
                <td
                  key={index}
                  className={[
                    "area-availability-table__cell",
                    "area-availability-table__cell--" +
                      (isAvailable ? "available" : "reserved"),
                    isFullHour(timeslots[index])
                      ? "area-availability-table__cell--hour"
                      : "",
                  ].join(" ")}
                ></td>
              ))}
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}

interface SelectLibraryProps {
  libraryInfo: LibraryInfo
  selectedLibraryId: LibraryId
  handleSelectLibraryId: (libraryId: LibraryId) => void
}

function SelectLibrary({
  libraryInfo,
  selectedLibraryId,
  handleSelectLibraryId,
}: SelectLibraryProps) {
  return (
    <label className="custom-form-group">
      <FiMapPin className="custom-form-group-icon" />
      <select
        className="custom-select"
        value={selectedLibraryId}
        onChange={(e) =>
          handleSelectLibraryId(parseInt(e.target.value))
        }
      >
        {Array.from(libraryInfo.entries()).map(
          ([libraryId, libraryDetails]) => (
            <option
              className="custom-select-option"
              key={libraryId}
              value={libraryId}
            >
              {libraryDetails.name}
            </option>
          ),
        )}
      </select>
    </label>
  )
}

interface SelectAreaProps {
  areaInfo: AreaInfo
  selectedAreaId: AreaId
  handleSelectAreaId: (areaId: AreaId) => void
}

function SelectArea({
  areaInfo,
  selectedAreaId,
  handleSelectAreaId,
}: SelectAreaProps) {
  return (
    <label className="custom-form-group">
      <FiBookOpen className="custom-form-group-icon" />
      <select
        className="custom-select"
        value={selectedAreaId}
        onChange={(e) =>
          handleSelectAreaId(parseInt(e.target.value))
        }
      >
        {Array.from(areaInfo.entries()).map(
          ([areaId, areaDetails]) => (
            <option key={areaId} value={areaId}>
              {areaDetails.name}
            </option>
          ),
        )}
      </select>
    </label>
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
    <div className="custom-form-group">
      <FiCalendar className="custom-form-group-icon" />
      <fieldset className="custom-radio-fieldset">
        <label className="custom-radio-label">
          <input
            className="custom-radio-button"
            type="radio"
            checked={isSameDay(selectedDate, today)}
            onChange={(e) => handleSelectDate(today)}
          />
          {`Today (${formatDate(today)})`}
        </label>
        <label className="custom-radio-label">
          <input
            className="custom-radio-button"
            type="radio"
            checked={isSameDay(selectedDate, tomorrow)}
            onChange={(e) => handleSelectDate(tomorrow)}
          />
          {`Tomorrow (${formatDate(tomorrow)})`}
        </label>
      </fieldset>
    </div>
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
      <div className="dashed-divider" />
      <SelectArea
        areaInfo={areaInfo}
        selectedAreaId={areaId}
        handleSelectAreaId={setAreaId}
      />
      <div className="dashed-divider" />
      <SelectDate
        selectedDate={date}
        handleSelectDate={setDate}
      />
      <div className="solid-divider" />
      <AreaAvailabilityTable
        areaDetails={areaDetails}
        datedAreaAvailability={datedAreaAvailability}
      />
    </>
  )
}

export default App
