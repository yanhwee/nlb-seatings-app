import React from "react"
import "./App.css"
import {
  cachedLibraryAvailability,
  cachedLibraryInfo,
} from "./cache"
import { getTimeslots } from "./service"
import { isFullHour } from "./utils"
import type {
  AreaDetails,
  DatedAreaAvailability,
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

function App() {
  const areaIdIndex = 0
  const libraryId = 31
  const libraryInfo = cachedLibraryInfo
  const libraryDetails = libraryInfo.get(libraryId)
  if (!libraryDetails) throw new Error()
  const areaInfo = libraryDetails.areaInfo
  const areaId = [...areaInfo.keys()][areaIdIndex]
  const areaDetails = areaInfo.get(areaId)
  if (!areaDetails) throw new Error()

  const libraryAvailability = cachedLibraryAvailability
  const datedAreaAvailability = libraryAvailability.get(areaId)
  if (!datedAreaAvailability) throw new Error()

  return (
    <>
      <AreaAvailabilityTable
        areaDetails={areaDetails}
        datedAreaAvailability={datedAreaAvailability}
      />
    </>
  )
}

export default App
