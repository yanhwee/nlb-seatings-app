import { FiMap } from "react-icons/fi"
import styles from "./ViewMap.module.css"

function ViewMap() {
  return (
    <button className={styles["view-map-button"]}>
      <FiMap className={styles["view-map-button-icon"]} />
      <span className={styles["view-map-button-label"]}>
        View Map
      </span>
    </button>
  )
}

export default ViewMap
