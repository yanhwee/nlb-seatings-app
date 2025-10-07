"use client"

import { useState } from "react"
import "./App.css"
import {
  cachedLibraryAvailability,
  cachedLibraryInfo,
} from "@/lib/cache"
import type { AreaId, LibraryId } from "@/lib/types"
import SelectArea from "@/components/SelectArea/SelectArea"
import SelectDate from "@/components/SelectDate/SelectDate"
import SelectLibrary from "@/components/SelectLibrary/SelectLibrary"
import AreaAvailabilityTable from "@/components/AreaAvailabilityTable/AreaAvailabilityTable"
import ViewMap from "@/components/ViewMap/ViewMap"
import AreaAvailabilityTableLegend from "@/components/AreaAvailabilityTableLegend/AreaAvailabilityTableLegend"
import SelectZoom from "@/components/SelectZoom/SelectZoom"

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

  const [zoomLevel, setZoomLevel] = useState<number>(100)

  return (
    <div id="app-container">
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
      <div id="toolbar">
        <ViewMap />
        <AreaAvailabilityTableLegend />
        <SelectZoom
          selectedZoomLevel={zoomLevel}
          handleSelectZoomLevel={setZoomLevel}
        />
      </div>
      <AreaAvailabilityTable
        areaDetails={areaDetails}
        datedAreaAvailability={datedAreaAvailability}
        zoomLevel={zoomLevel}
      />
    </div>
  )
}

export default App
