import tableStyles from "../AreaAvailabilityTable/AreaAvailabilityTable.module.css"
import styles from "./AreaAvailabilityTableLegend.module.css"

function AreaAvailabilityTableLegend() {
  return (
    <div className={styles["legend"]}>
      <div className={styles["legend-item"]}>
        <div
          className={[
            styles["legend-item-icon"],
            tableStyles["cell--available"],
          ].join(" ")}
        ></div>
        <span className={styles["legend-item-label"]}>
          Available
        </span>
      </div>
      <div className={styles["legend-item"]}>
        <div
          className={[
            styles["legend-item-icon"],
            tableStyles["cell--reserved"],
          ].join(" ")}
        ></div>
        <span className={styles["legend-item-label"]}>
          Reserved
        </span>
      </div>
    </div>
  )
}

export default AreaAvailabilityTableLegend
