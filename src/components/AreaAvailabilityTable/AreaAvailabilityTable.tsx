import { getTimeslots } from "../../service"
import type {
  AreaDetails,
  DatedAreaAvailability,
} from "../../types"
import { format24HourTime, isFullHour } from "../../utils"
import styles from "./AreaAvailabilityTable.module.css"

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

  const tableWidthPercent = 150
  const cellHeightPx = 24
  return (
    <div className={styles["table-viewer"]}>
      <table
        className={styles["table"]}
        style={{ width: `${tableWidthPercent}%` }}
      >
        <thead>
          <tr className={styles["top-header"]}>
            <th className={styles["top-left-cell"]}></th>
            {timeslots.map((timeslot, index) => (
              <th
                key={index}
                className={styles["time-header-cell"]}
              >
                <div
                  className={
                    styles["time-header-label-wrapper"]
                  }
                >
                  <div
                    className={[
                      styles["time-header-label"],
                      styles[
                        "time-header-label--" +
                          (isFullHour(timeslot)
                            ? "full-hour"
                            : "quarter-hour")
                      ],
                    ].join(" ")}
                  >
                    {format24HourTime(timeslot)}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(areaAvailability.entries()).map(
            ([seatId, seatAvailability]) => (
              <tr>
                <th
                  className={styles["seat-header-cell"]}
                  style={{
                    height: `${cellHeightPx}px`,
                  }}
                >
                  {seatInfo.get(seatId)?.name}
                </th>
                {seatAvailability.map((isAvailable, index) => (
                  <td
                    key={index}
                    className={[
                      styles["cell"],
                      styles[
                        "cell--" +
                          (isAvailable
                            ? "available"
                            : "reserved")
                      ],
                      isFullHour(timeslots[index])
                        ? styles["cell--hour"]
                        : "",
                    ].join(" ")}
                  ></td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AreaAvailabilityTable
