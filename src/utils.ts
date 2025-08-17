/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  LibraryInfo,
  AreaInfo,
  SeatInfo,
  LibraryAvailability,
  AreaId,
  SeatId,
  SeatAvailability,
  DatedAreaAvailability,
} from "./types.ts"

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
          openingTime: areaDetails.openingTime.toISOString(), // Convert Date to a string
          closingTime: areaDetails.closingTime.toISOString(), // Convert Date to a string
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
  return JSON.stringify(serializableLibraries, null, 2)
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

  return JSON.stringify(serializableData, null, 2)
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

/**
 * Converts a Date object to a local ISO 8601 string in the format "YYYY-MM-DDTHH:mm:ss".
 *
 * This function formats the date based on the local time zone of the user's environment.
 * It is useful for creating human-readable date and time strings that are consistent
 * with the local time without including the timezone offset.
 * * @param date The Date object to format.
 * @returns The formatted date string in local ISO 8601 format.
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1)
    .toString()
    .padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hour = date.getHours().toString().padStart(2, "0")
  const minute = date.getMinutes().toString().padStart(2, "0")
  const second = date.getSeconds().toString().padStart(2, "0")
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

/**
 * Checks if a given Date object represents a full hour (e.g., 10:00:00.000).
 * @param date The Date object to check.
 * @returns True if the time is on a full hour, otherwise False.
 */
export function isFullHour(date: Date): boolean {
  return (
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  )
}

/**
 * Sets the year, month, and day of a target date to match a source date.
 * @param targetDate The date to be modified.
 * @param sourceDate The date to copy the year, month, and day from.
 * @returns The modified target date.
 */
export function setDate(
  targetDate: Date,
  sourceDate: Date,
): Date {
  targetDate.setFullYear(
    sourceDate.getFullYear(),
    sourceDate.getMonth(),
    sourceDate.getDate(),
  )
  return targetDate
}

/**
 * Checks if two Date objects fall on the same calendar day.
 * It compares the year, month, and day of each date, ignoring the time.
 * * @param {Date} date1 The first date to compare.
 * @param {Date} date2 The second date to compare.
 * @returns {boolean} True if both dates are on the same day, false otherwise.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Formats a given Date object into a string like "23 Jul".
 *
 * @param date The date to format.
 * @returns A formatted date string.
 */
export function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  })
  return formatter.format(date)
}
