import {
  getLibraryAvailability,
  getLibraryInfo,
} from "@/lib/service"
import { serializeLibraryAvailability } from "@/lib/utils"

async function main() {
  const libraryInfo = await getLibraryInfo()
  // console.log(serializeLibraryInfo(libraryInfo))
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const data = await getLibraryAvailability(
    libraryInfo,
    31,
    tomorrow,
  )
  console.log(serializeLibraryAvailability(data))
}

main()
