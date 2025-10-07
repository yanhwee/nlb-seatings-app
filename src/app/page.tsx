import App from "@/components/App/App"
import { getLibraryInfo } from "@/lib/server"

export default async function Home() {
  const libraryInfo = await getLibraryInfo()

  return <App libraryInfo={libraryInfo} />
}
