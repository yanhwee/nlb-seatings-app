/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  LibraryInfo,
  AreaInfo,
  SeatInfo,
  LibraryAvailability,
  SeatId,
  SeatAvailability,
  DatedAreaAvailability,
} from "@/lib/types"

/**
 * Converts a LibraryInfo Map into a serializable object.
 * @param libraryInfo The Map to serialize.
 * @returns A JSON string representing the nested data structure.
 */
export function serializeLibraryInfo(
  libraryInfo: LibraryInfo,
): string {
  // Convert the top-level LibraryInfo Map to an array of [key, value] pairs.
  const serializableLibraries = Array.from(
    libraryInfo.entries(),
  ).map(([libraryId, libraryDetails]) => {
    // For each LibraryDetails object, convert its nested AreaInfo Map.
    const serializableAreas = Array.from(
      libraryDetails.areaInfo.entries(),
    ).map(([areaId, areaDetails]) => {
      // For each AreaDetails object, convert its nested SeatInfo Map.
      const serializableSeats = Array.from(
        areaDetails.seatInfo.entries(),
      )

      // Return the serializable AreaDetails object, converting Dates to ISO strings.
      return [
        areaId,
        {
          name: areaDetails.name,
          openingTime: areaDetails.openingTime.toString(), // Convert Date to a string
          closingTime: areaDetails.closingTime.toString(), // Convert Date to a string
          seatInfo: serializableSeats, // The seats are now an array
        },
      ]
    })

    // Return the serializable LibraryDetails object with the array of areas.
    return [
      libraryId,
      {
        name: libraryDetails.name,
        areaInfo: serializableAreas,
      },
    ]
  })

  // Finally, use JSON.stringify to convert the entire structure into a string.
  return JSON.stringify(serializableLibraries)
}

/**
 * Converts a JSON string back into a typed LibraryInfo Map.
 * @param jsonString The JSON string to deserialize.
 * @returns A fully typed LibraryInfo Map.
 */
export function deserializeLibraryInfo(
  jsonString: string,
): LibraryInfo {
  // Parse the JSON string back into a nested array structure.
  const parsedData = JSON.parse(jsonString)

  // Rebuild the top-level LibraryInfo Map.
  const libraryInfo: LibraryInfo = new Map(
    parsedData.map(([libraryId, libraryDetails]: any) => {
      // Rebuild the nested AreaInfo Map.
      const areaInfo: AreaInfo = new Map(
        libraryDetails.areaInfo.map(
          ([areaId, areaDetails]: any) => {
            // Rebuild the nested SeatInfo Map.
            const seatInfo: SeatInfo = new Map(
              areaDetails.seatInfo,
            )

            // Return the AreaDetails object, converting ISO strings back to Dates.
            return [
              areaId,
              {
                name: areaDetails.name,
                openingTime: new Date(areaDetails.openingTime), // Convert string to Date
                closingTime: new Date(areaDetails.closingTime), // Convert string to Date
                seatInfo: seatInfo,
              },
            ]
          },
        ),
      )

      // Return the LibraryDetails object with the AreaInfo Map.
      return [
        libraryId,
        {
          name: libraryDetails.name,
          areaInfo: areaInfo,
        },
      ]
    }),
  )

  return libraryInfo
}

/**
 * Serializes a LibraryAvailability Map into a JSON string.
 * @param libraryAvailability The Map to serialize.
 * @returns A JSON string representing the nested data structure.
 */
export function serializeLibraryAvailability(
  libraryAvailability: LibraryAvailability,
): string {
  // Convert the outer Map into an array of [AreaId, DatedAreaAvailability]
  const serializableData = Array.from(
    libraryAvailability.entries(),
  ).map(([areaId, datedAreaAvailability]) => {
    // Convert the nested Map and Date objects for serialization
    const serializedAreaAvailability = Array.from(
      datedAreaAvailability.areaAvailability.entries(),
    )

    const serializedDatedAreaAvailability = {
      startDatetime:
        datedAreaAvailability.startDatetime.toISOString(),
      endDatetime:
        datedAreaAvailability.endDatetime.toISOString(),
      areaAvailability: serializedAreaAvailability,
    }

    return [areaId, serializedDatedAreaAvailability]
  })

  return JSON.stringify(serializableData)
}

/**
 * Deserializes a JSON string back into a typed LibraryAvailability Map.
 * @param jsonString The JSON string to deserialize.
 * @returns A fully typed LibraryAvailability Map.
 */
export function deserializeLibraryAvailability(
  jsonString: string,
): LibraryAvailability {
  // Parse the JSON string back into the intermediate array structure
  const parsedData = JSON.parse(jsonString)

  // Rebuild the top-level LibraryAvailability Map
  const libraryAvailability: LibraryAvailability = new Map(
    parsedData.map(
      ([areaId, serializedDatedAvailability]: any) => {
        // Rebuild the nested AreaAvailability Map from the array
        const areaAvailability = new Map<
          SeatId,
          SeatAvailability
        >(serializedDatedAvailability.areaAvailability)

        // Reconstruct the DatedAreaAvailability object, converting ISO strings back to Dates
        const datedAvailability: DatedAreaAvailability = {
          startDatetime: new Date(
            serializedDatedAvailability.startDatetime,
          ),
          endDatetime: new Date(
            serializedDatedAvailability.endDatetime,
          ),
          areaAvailability: areaAvailability,
        }

        return [areaId, datedAvailability]
      },
    ),
  )

  return libraryAvailability
}
