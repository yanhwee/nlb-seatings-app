import App from "@/components/App/App"
import { getLibraryInfo } from "@/lib/server"
import { SWRConfig } from "swr"

export default async function Home() {
  const libraryInfo = await getLibraryInfo()

  return (
    <SWRConfig
      value={{
        // revalidateIfStale: false,
        // revalidateOnFocus: false,
        // revalidateOnReconnect: false,
        keepPreviousData: true,
      }}
    >
      <App libraryInfo={libraryInfo} />
    </SWRConfig>
  )
}
