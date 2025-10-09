import {
  getLibraryAreasMapUrl,
  getLibraryInfo,
} from "./src/lib/service"

async function main() {
  const libraryId = 16
  const libraryInfo = await getLibraryInfo()
  const libraryDetails = libraryInfo.get(libraryId)!
  const areaInfo = libraryDetails.areaInfo
  const urls = await getLibraryAreasMapUrl(libraryId, areaInfo)
  console.log(urls.size)
  console.log(urls)
}

main()
