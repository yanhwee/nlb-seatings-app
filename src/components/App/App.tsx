"use client"

import { useEffect, useState } from "react"
import "./App.css"
import { cachedLibraryAvailability } from "@/lib/cache"
import {
  DatedAreaAvailability,
  type AreaId,
  type LibraryId,
  type LibraryInfo,
} from "@/lib/types"
import SelectArea from "@/components/SelectArea/SelectArea"
import SelectDate from "@/components/SelectDate/SelectDate"
import SelectLibrary from "@/components/SelectLibrary/SelectLibrary"
import AreaAvailabilityTable from "@/components/AreaAvailabilityTable/AreaAvailabilityTable"
import ViewMap from "@/components/ViewMap/ViewMap"
import AreaAvailabilityTableLegend from "@/components/AreaAvailabilityTableLegend/AreaAvailabilityTableLegend"
import SelectZoom from "@/components/SelectZoom/SelectZoom"
import { getLibraryAvailability } from "@/lib/server"

interface AppProps {
  libraryInfo: LibraryInfo
}

function App({ libraryInfo }: AppProps) {
  const defaultLibraryId = 31 //libraryInfo.keys().next().value!

  const [libraryId, setLibraryId] =
    useState<LibraryId>(defaultLibraryId)

  const libraryDetails = libraryInfo.get(libraryId)!
  const areaInfo = libraryDetails.areaInfo
  const defaultAreaId = areaInfo.keys().next().value!

  const [areaId, setAreaId] = useState<AreaId>(defaultAreaId)

  const areaDetails = areaInfo.get(areaId)!

  const [date, setDate] = useState<Date>(new Date())
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  const [datedAreaAvailability, setDatedAreaAvailability] =
    useState<DatedAreaAvailability>(
      cachedLibraryAvailability.get(areaId)!,
    )

  useEffect(() => {
    async function fetchDatedAreaAvailaibility() {
      const libraryAvailability = await getLibraryAvailability(
        libraryId,
        date,
      )
      const datedAreaAvailability =
        libraryAvailability.get(areaId)!
      setDatedAreaAvailability(datedAreaAvailability)
    }
    fetchDatedAreaAvailaibility()
  }, [libraryId, areaId, date])

  function handleSelectLibraryId(libraryId: LibraryId) {
    const libraryDetails = libraryInfo?.get(libraryId)
    if (!libraryDetails) throw new Error()
    const areaInfo = libraryDetails.areaInfo
    const areaId = areaInfo.keys().next().value
    if (!areaId) throw new Error()
    setLibraryId(libraryId)
    setAreaId(areaId)
  }

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
        currentDatetime={new Date()}
        areaDetails={areaDetails}
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
