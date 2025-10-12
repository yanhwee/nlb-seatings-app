import { FiCalendar } from "react-icons/fi"
import styles from "./SelectDate.module.css"
import FormGroup from "../FormGroup/FormGroup"
import { formatLocalDate } from "@/lib/date-utils"

interface SelectDateProps {
  today: Date
  tomorrow: Date
  isTodaySelected: boolean
  isTodayDisabled: boolean
  isTomorrowDisabled: boolean
  handleSelectIsTodaySelected: (b: boolean) => void
}

function SelectDate({
  today,
  tomorrow,
  isTodaySelected,
  isTodayDisabled,
  isTomorrowDisabled,
  handleSelectIsTodaySelected,
}: SelectDateProps) {
  const formatDate = (date: Date) =>
    formatLocalDate(date, "dd MMM")
  return (
    <FormGroup icon={FiCalendar}>
      <fieldset className={styles["custom-radio-fieldset"]}>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={isTodaySelected}
            onChange={() => handleSelectIsTodaySelected(true)}
            disabled={isTodayDisabled}
          />
          {`Today (${formatDate(today)})`}
        </label>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={!isTodaySelected}
            onChange={() => handleSelectIsTodaySelected(false)}
            disabled={isTomorrowDisabled}
          />
          {`Tomorrow (${formatDate(tomorrow)})`}
        </label>
      </fieldset>
    </FormGroup>
  )
}

export default SelectDate
