import styles from "./SelectZoom.module.css"

interface SelectZoomProps {
  selectedZoomLevel: number
  handleSelectZoomLevel: (zoomLevel: number) => void
}

function SelectZoom({
  selectedZoomLevel,
  handleSelectZoomLevel,
}: SelectZoomProps) {
  const zoomLevels = [100, 150, 200, 250, 300, 350]
  return (
    <select
      className={styles["custom-select"]}
      value={selectedZoomLevel}
      onChange={(e) =>
        handleSelectZoomLevel(parseInt(e.target.value))
      }
    >
      {zoomLevels.map((zoom) => (
        <option key={zoom} value={zoom}>{`${zoom}%`}</option>
      ))}
    </select>
  )
}

export default SelectZoom
