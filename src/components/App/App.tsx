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
import {
  addDays,
  getLocalHours,
  setLocalHHmm,
} from "@/lib/date-utils"

interface AppProps {
  libraryInfo: LibraryInfo
}

function App({ libraryInfo }: AppProps) {
  /* Pure */
  const getLibraryDetails = (libraryId: LibraryId) => {
    const libraryDetails = libraryInfo.get(libraryId)!
    const areaInfo = libraryDetails.areaInfo
    const defaultAreaId = areaInfo.keys().next().value!
    return {
      libraryDetails,
      areaInfo,
      defaultAreaId,
    }
  }
  const getAreaDetails = (
    libraryId: LibraryId,
    areaId: AreaId,
  ) => {
    const { areaInfo } = getLibraryDetails(libraryId)
    const areaDetails = areaInfo.get(areaId)!
    const openingTime = areaDetails.openingTime
    const closingTime = areaDetails.closingTime
    return {
      areaDetails,
      openingTime,
      closingTime,
    }
  }
  const getDayDetails = (
    libraryId: LibraryId,
    areaId: AreaId,
    now: Date,
  ) => {
    const today = setLocalHHmm(now, "0000")
    const tomorrow = addDays(today, 1)
    const { closingTime } = getAreaDetails(libraryId, areaId)
    const closingDatetime = setLocalHHmm(now, closingTime)
    const isTodayOver = closingDatetime <= now
    const isTomorrowStarted = getLocalHours(now) >= 12
    return { today, tomorrow, isTodayOver, isTomorrowStarted }
  }

  /* States */
  const [libraryId, setLibraryId] = useState<LibraryId>(
    () => 31,
  )
  const [areaId, setAreaId] = useState<AreaId>(
    () => getLibraryDetails(libraryId).defaultAreaId,
  )
  const [now, setNow] = useState<Date>(() => new Date())
  const [isTodaySelected, setIsTodaySelected] =
    useState<boolean>(
      () => !getDayDetails(libraryId, areaId, now).isTodayOver,
    )
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  /* Maintain state validity */
  const handleSelectLibraryId = (libraryId: LibraryId) => {
    setLibraryId(libraryId)
    setAreaId(getLibraryDetails(libraryId).defaultAreaId)
    setLocalStorage("libraryId", libraryId)
  }

  /* Reactive values */
  const { areaInfo } = getLibraryDetails(libraryId)
  const { areaDetails } = getAreaDetails(libraryId, areaId)
  const { today, tomorrow, isTodayOver, isTomorrowStarted } =
    getDayDetails(libraryId, areaId, now)
  const selectedDate = isTodaySelected ? today : tomorrow
  const libraryAvailability = useLibraryAvailability(
    libraryId,
    selectedDate,
  )
  const datedAreaAvailability = libraryAvailability?.get(areaId)

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
        today={today}
        tomorrow={tomorrow}
        isTodaySelected={isTodaySelected}
        isTodayDisabled={isTodayOver}
        isTomorrowDisabled={!isTomorrowStarted}
        handleSelectIsTodaySelected={setIsTodaySelected}
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
      {!datedAreaAvailability ? (
        <div className="center-div">Loading...</div>
      ) : (
        <AreaAvailabilityTable
          areaDetails={areaDetails}
          datedAreaAvailability={datedAreaAvailability}
          zoomLevel={zoomLevel}
        />
      )}
    </div>
  )
}

export default App
