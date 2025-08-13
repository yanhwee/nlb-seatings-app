import { cachedLibraryAvailability } from "./cache.ts"
import {
  getLibraryAvailability,
  getLibraryInfo,
} from "./service.ts"
import { serializeLibraryAvailability } from "./utils.ts"

async function main() {
  const libraryInfo = await getLibraryInfo()
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const data = await getLibraryAvailability(
    libraryInfo,
    31,
    today,
  )
  console.log(serializeLibraryAvailability(data))
}

function test() {
  console.log(cachedLibraryAvailability)
}

// main()
test()
