import FormGroup from "../FormGroup/FormGroup"
import styles from "./SelectFormGroup.module.css"

interface SelectFormGroupProps {
  icon: React.ComponentType<{ className?: string }>
  options: Iterable<[number, string]>
  selectedValue: number
  handleSelect: (id: number) => void
}

function SelectFormGroup({
  icon: Icon,
  options,
  selectedValue,
  handleSelect,
}: SelectFormGroupProps) {
  return (
    <FormGroup icon={Icon}>
      <select
        className={styles["custom-select"]}
        value={selectedValue}
        onChange={(e) => handleSelect(parseInt(e.target.value))}
      >
        {Array.from(options).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </FormGroup>
  )
}

export default SelectFormGroup
