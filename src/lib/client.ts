import * as server from "@/lib/server"
import useSWR from "swr"
import { LibraryId } from "./types"

function useLibraryAvailability(
  libraryId: LibraryId,
  date: Date,
) {
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

function useLibraryAreasMapUrl(libraryId: LibraryId) {
  const { data, error, isLoading } = useSWR(
    [libraryId],
    ([libraryId]) => server.getLibraryAreasMapUrl(libraryId),
  )
  return {
    libraryAreasMapUrl: data,
    isLoading,
    isError: error,
  }
}

export { useLibraryAvailability, useLibraryAreasMapUrl }
