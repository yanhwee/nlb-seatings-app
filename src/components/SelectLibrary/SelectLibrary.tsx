import { FiMapPin } from "react-icons/fi"
import type {
  LibraryInfo,
  LibraryId,
} from "../../../../src/lib/types"
import SelectFormGroup from "../SelectFormGroup/SelectFormGroup"

interface SelectLibraryProps {
  libraryInfo: LibraryInfo
  selectedLibraryId: LibraryId
  handleSelectLibraryId: (libraryId: LibraryId) => void
}

function SelectLibrary({
  libraryInfo,
  selectedLibraryId,
  handleSelectLibraryId,
}: SelectLibraryProps) {
  return (
    <SelectFormGroup
      icon={FiMapPin}
      options={Array.from(libraryInfo.entries()).map(
        ([libraryId, libraryDetails]) => [
          libraryId,
          libraryDetails.name,
        ],
      )}
      selectedValue={selectedLibraryId}
      handleSelect={handleSelectLibraryId}
    />
  )
}

export default SelectLibrary
