import * as server from "@/lib/server"
import useSWR from "swr"

function useLibraryAvailability(libraryId: number, date: Date) {
  const { data, error, isLoading } = useSWR(
    [libraryId, date],
    ([libraryId, date]) =>
      server.getLibraryAvailability(libraryId, date),
  )
  return {
    libraryAvailability: data,
    isLoading,
    isError: error,
  }
}

export { useLibraryAvailability }
