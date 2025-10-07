import { getTimeslots } from "@/lib/service"
import type {
  AreaDetails,
  DatedAreaAvailability,
} from "@/lib/types"
import { format24HourTime, isFullHour } from "@/lib/utils"
import styles from "./AreaAvailabilityTable.module.css"

interface AreaAvailabilityTableProps {
  areaDetails: AreaDetails
  datedAreaAvailability: DatedAreaAvailability
  zoomLevel: number
}

function AreaAvailabilityTable({
  areaDetails,
  datedAreaAvailability,
  zoomLevel: tableWidthPercent,
}: AreaAvailabilityTableProps) {
  const { startDatetime, endDatetime, areaAvailability } =
    datedAreaAvailability
  const timeslots = getTimeslots(startDatetime, endDatetime)
  const seatInfo = areaDetails.seatInfo

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
              <tr key={seatId}>
                <th className={styles["seat-header-cell"]}>
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
