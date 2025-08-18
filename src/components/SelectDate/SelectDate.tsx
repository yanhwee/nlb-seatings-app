import { FiCalendar } from "react-icons/fi"
import { isSameDay, formatDate } from "../../utils"
import styles from "./SelectDate.module.css"
import FormGroup from "../FormGroup/FormGroup"

interface SelectDateProps {
  selectedDate: Date
  handleSelectDate: (date: Date) => void
}

function SelectDate({
  selectedDate,
  handleSelectDate,
}: SelectDateProps) {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    <FormGroup icon={FiCalendar}>
      <fieldset className={styles["custom-radio-fieldset"]}>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={isSameDay(selectedDate, today)}
            onChange={(e) => handleSelectDate(today)}
          />
          {`Today (${formatDate(today)})`}
        </label>
        <label className={styles["custom-radio-label"]}>
          <input
            className={styles["custom-radio-button"]}
            type="radio"
            checked={isSameDay(selectedDate, tomorrow)}
            onChange={(e) => handleSelectDate(tomorrow)}
          />
          {`Tomorrow (${formatDate(tomorrow)})`}
        </label>
      </fieldset>
    </FormGroup>
  )
}

export default SelectDate
