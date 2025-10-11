"use client"

import { useCallback, useState } from "react"
import "./App.css"
import * as utils from "@/lib/utils"
import {
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
import { useLibraryAvailability } from "@/lib/client"
import {
  getLocalStorage,
  setLocalStorage,
} from "@/lib/localstorage"

interface AppProps {
  libraryInfo: LibraryInfo
}

function App({ libraryInfo }: AppProps) {
  const defaultLibraryId =
    getLocalStorage<LibraryId>("libraryId") ??
    // libraryInfo.keys().next().value ??
    31

  const [libraryId, setLibraryId] =
    useState<LibraryId>(defaultLibraryId)

  const changeLibraryId = useCallback(
    (libraryId: LibraryId) => {
      const libraryDetails = libraryInfo.get(libraryId)!
      const areaInfo = libraryDetails.areaInfo
      const areaId = areaInfo.keys().next().value!
      setLibraryId(libraryId)
      setAreaId(areaId)
      setLocalStorage("libraryId", libraryId)
    },
    [libraryInfo],
  )

  const libraryDetails = libraryInfo.get(libraryId)!
  const areaInfo = libraryDetails.areaInfo
  const defaultAreaId = areaInfo.keys().next().value!

  const [areaId, setAreaId] = useState<AreaId>(defaultAreaId)

  const areaDetails = areaInfo.get(areaId)!

  const defaultDate = new Date()
  const areaClosingDatetime = new Date(areaDetails.closingTime)
  utils.setDate(areaClosingDatetime, defaultDate)
  if (defaultDate.getTime() >= areaClosingDatetime.getTime())
    defaultDate.setDate(defaultDate.getDate() + 1)
  const [date, setDate] = useState<Date>(defaultDate)

  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // const libraryAvailability = useLibraryAvailability(
  //   libraryId,
  //   date,
  // )

  // const datedAreaAvailability = libraryAvailability?.get(areaId)

  return (
    <div id="app-container">
      <SelectLibrary
        libraryInfo={libraryInfo}
        selectedLibraryId={libraryId}
        handleSelectLibraryId={changeLibraryId}
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
        <ViewMap libraryId={libraryId} areaId={areaId} />
        <AreaAvailabilityTableLegend />
        <SelectZoom
          selectedZoomLevel={zoomLevel}
          handleSelectZoomLevel={setZoomLevel}
        />
      </div>
      {/* {!datedAreaAvailability ? (
        <div className="center-div">Loading...</div>
      ) : (
        <AreaAvailabilityTable
          areaDetails={areaDetails}
          datedAreaAvailability={datedAreaAvailability}
          zoomLevel={zoomLevel}
        />
      )} */}
    </div>
  )
}

export default App
