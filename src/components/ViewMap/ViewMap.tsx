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

  const { libraryAreasMapUrl, error } =
    useLibraryAreasMapUrl(libraryId)

  let images = null
  if (libraryAreasMapUrl) {
    const areaMapUrl = libraryAreasMapUrl.get(areaId)!
    const areaMapImageUrl = getAreaMapImageUrl(areaMapUrl)
    const [imageUrl1, imageUrl2] = areaMapImageUrl
    images = (
      <>
        <img
          className={styles["view-map-dialog-image"]}
          src={imageUrl1}
          alt="Area map image"
        />
        <img
          className={styles["view-map-dialog-image"]}
          src={imageUrl2}
          alt="Area map image"
        />
      </>
    )
  }

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
            {error ? (
              <div className={styles["loading-error-div"]}>
                Failed to fetch data
              </div>
            ) : !images ? (
              <div className={styles["loading-error-div"]}>
                Loading...
              </div>
            ) : (
              images
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

export default ViewMap
