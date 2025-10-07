import type { ReactNode } from "react"
import styles from "./FormGroup.module.css"

interface FormGroupProps {
  children: ReactNode
  icon: React.ComponentType<{ className?: string }>
}

function FormGroup({ children, icon: Icon }: FormGroupProps) {
  return (
    <div className={styles["form-group"]}>
      {Icon && <Icon className={styles["form-group-icon"]} />}
      {children}
    </div>
  )
}

export default FormGroup
