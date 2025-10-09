/* eslint-disable @next/next/no-img-element */
import { FiMap } from "react-icons/fi"
import styles from "./ViewMap.module.css"
import { createPortal } from "react-dom"
import { AreaId, LibraryId } from "@/lib/types"
import { useState } from "react"
import { useLibraryAreasMapUrl } from "@/lib/client"
import { getAreaMapImageUrl } from "@/lib/service"

interface ViewMapProps {
  libraryId: LibraryId
  areaId: AreaId
}

function ViewMap({ libraryId, areaId }: ViewMapProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const { libraryAreasMapUrl, isLoading, isError } =
    useLibraryAreasMapUrl(libraryId)

  const areaMapUrl = libraryAreasMapUrl?.get(areaId)

  const areaMapImageUrl =
    areaMapUrl && getAreaMapImageUrl(areaMapUrl)

  return (
    <>
      <button
        className={styles["view-map-button"]}
        onClick={() => setIsOpen(true)}
      >
        <FiMap className={styles["view-map-button-icon"]} />
        <span className={styles["view-map-button-label"]}>
          View Map
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles["view-map-dialog"]}
            onClick={() => setIsOpen(false)}
          >
            {isLoading ? (
              <div className={styles["loading-error-div"]}>
                Loading...
              </div>
            ) : isError ? (
              <div className={styles["loading-error-div"]}>
                Failed to fetch data
              </div>
            ) : (
              <>
                <img
                  className={styles["view-map-dialog-image"]}
                  src={areaMapImageUrl![0]}
                  alt="Area map image 1"
                />
                <img
                  className={styles["view-map-dialog-image"]}
                  src={areaMapImageUrl![1]}
                  alt="Area map image 2"
                />
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

export default ViewMap
