import { getTimeslots } from "../../service"
import type {
  AreaDetails,
  DatedAreaAvailability,
} from "../../types"
import { isFullHour } from "../../utils"
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
  const numberOfTimeslots = timeslots.length
  const numberOfSeats = areaAvailability.size

  const tableWidthPercent = 100
  const cellHeightPx = 24
  return (
    <div className={styles["table-viewer"]}>
      <table
        className={styles["table"]}
        style={{ width: `${tableWidthPercent}%` }}
      >
        <thead>
          <tr>
            <th className={styles["table__top-left-cell"]} />
            {timeslots.map((timeslot, index) => (
              <th
                key={index}
                className={styles["table__time-label-cell"]}
              >
                <div className={styles["table__time-label"]}>
                  {isFullHour(timeslot)
                    ? timeslot.getHours()
                    : ""}
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
                  className={styles["table__seat-label-cell"]}
                  style={{ height: `${cellHeightPx}px` }}
                >
                  {seatInfo.get(seatId)?.name}
                </th>
                {seatAvailability.map((isAvailable, index) => (
                  <td
                    key={index}
                    className={[
                      styles["table__cell"],
                      styles[
                        "table__cell--" +
                          (isAvailable
                            ? "available"
                            : "reserved")
                      ],
                      isFullHour(timeslots[index])
                        ? styles["table__cell--hour"]
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
