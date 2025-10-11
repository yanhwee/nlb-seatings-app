import App from "@/components/App/App"
import ClientRender from "@/components/ClientRender/ClientRender"
import { getLibraryInfo } from "@/lib/server"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default async function Home() {
  const libraryInfo = await getLibraryInfo()

  return (
    <>
      <SpeedInsights />
      <ClientRender>
        <App libraryInfo={libraryInfo} />
      </ClientRender>
    </>
  )
}
