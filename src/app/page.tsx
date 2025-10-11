import App from "@/components/App/App"
import ClientRender from "@/components/ClientRender/ClientRender"
import { getLibraryInfo } from "@/lib/server"

export default async function Home() {
  const libraryInfo = await getLibraryInfo()

  return (
    <ClientRender>
      <App libraryInfo={libraryInfo} />
    </ClientRender>
  )
}
