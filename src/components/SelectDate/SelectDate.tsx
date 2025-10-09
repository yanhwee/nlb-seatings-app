import { FiCalendar } from "react-icons/fi"
import { isSameDay, formatDate, setDate } from "@/lib/utils"
import styles from "./SelectDate.module.css"
import FormGroup from "../FormGroup/FormGroup"
import { AreaDetails } from "@/lib/types"

interface SelectDateProps {
  selectedDate: Date
  handleSelectDate: (date: Date) => void
  currentDatetime: Date
  areaDetails: AreaDetails
}

function SelectDate({
  selectedDate,
  handleSelectDate,
  currentDatetime,
  areaDetails,
}: SelectDateProps) {
  const today = new Date(currentDatetime)
  const tomorrow = new Date(currentDatetime)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const areaClosingDatetime = new Date(areaDetails.closingTime)
  setDate(areaClosingDatetime, currentDatetime)
  return (
    <FormGroup icon={FiCalendar}>
      <fieldset className={styles["custom-radio-fieldset"]}>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={isSameDay(selectedDate, today)}
            onChange={() => handleSelectDate(today)}
            disabled={currentDatetime > areaClosingDatetime}
          />
          {`Today (${formatDate(today)})`}
        </label>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={isSameDay(selectedDate, tomorrow)}
            onChange={() => handleSelectDate(tomorrow)}
            disabled={currentDatetime.getHours() < 12}
          />
          {`Tomorrow (${formatDate(tomorrow)})`}
        </label>
      </fieldset>
    </FormGroup>
  )
}

export default SelectDate
