import { FiBookOpen } from "react-icons/fi"
import type { AreaId, AreaInfo } from "@/lib/types"
import SelectFormGroup from "../SelectFormGroup/SelectFormGroup"

interface SelectAreaProps {
  areaInfo: AreaInfo
  selectedAreaId: AreaId
  handleSelectAreaId: (areaId: AreaId) => void
}

function SelectArea({
  areaInfo,
  selectedAreaId,
  handleSelectAreaId,
}: SelectAreaProps) {
  return (
    <SelectFormGroup
      icon={FiBookOpen}
      options={Array.from(areaInfo.entries()).map(
        ([areaId, areaDetails]) => [areaId, areaDetails.name],
      )}
      selectedValue={selectedAreaId}
      handleSelect={handleSelectAreaId}
    />
  )
}

export default SelectArea
