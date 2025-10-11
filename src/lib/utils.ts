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
 *
 * @param {Date} date1 The first date to compare.
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

/**
 * Formats a Date object into a 24-hour time string (HHMM) with leading zeros.
 *
 * @param date The Date object to format.
 * @returns A string in the "HHMM" format (e.g., "0930" or "1445").
 */
export const format24HourTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}${minutes}`
}

/**
 * Checks if the given date is today.
 * @param date The Date object to check.
 * @returns true if the date is today, false otherwise.
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  // Check year, month, and day to ensure it's the same calendar day.
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Checks if the given date is tomorrow.
 * @param date The Date object to check.
 * @returns true if the date is tomorrow, false otherwise.
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date()
  // Set 'tomorrow' to be exactly one day after 'today'.
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check year, month, and day to ensure it's the same calendar day as tomorrow.
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  )
}

/**
 * Checks if the given date is yesterday.
 *
 * This function creates a date object for the day before the current date
 * and compares the year, month, and calendar day of the input date against it.
 *
 * @param date The Date object to check.
 * @returns true if the date is yesterday, false otherwise.
 */
export const isYesterday = (date: Date): boolean => {
  // 1. Create a temporary date object representing yesterday.
  const yesterday = new Date()

  // 2. Adjust the date back one day. Date methods automatically handle
  //    month and year rollovers (e.g., crossing into December 31st/January 1st).
  yesterday.setDate(yesterday.getDate() - 1)

  // 3. Compare year, month, and day components of the input date
  //    against the calculated 'yesterday' date.
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Gets a value from a Map if it exists, otherwise creates a new value,
 * sets it in the Map, and returns it.
 *
 * This function is a robust, generic utility for the "get or create" pattern,
 * ensuring clean and readable map interactions.
 *
 * @template K The type of the keys in the Map.
 * @template V The type of the values in the Map.
 * @param {Map<K, V>} map The Map to operate on.
 * @param {K} key The key to look up in the Map.
 * @param {() => V} factory A function that creates and returns a new value.
 * @returns {V} The existing or newly created value.
 */
export function getOrCreate<K, V>(
  map: Map<K, V>,
  key: K,
  factory: () => V,
): V {
  const existingValue = map.get(key)
  if (existingValue !== undefined) {
    return existingValue
  }

  const newValue = factory()
  map.set(key, newValue)
  return newValue
}

/**
 * Converts a Date object to a local date string in "YYYY-MM-DD" format.
 *
 * This function manually constructs the date string using local date components
 * to avoid implicit UTC conversions. This is ideal for hashing or comparisons
 * where only the local date, and not the time, is relevant.
 *
 * @param {Date} date The Date object to convert.
 * @returns {string} The formatted local date string (e.g., "2025-10-11").
 */
export function toLocalIsoDateString(date: Date): string {
  // Get the year component from the local time zone.
  const year = date.getFullYear()

  // getMonth() is zero-indexed (0-11), so add 1 for the correct month number,
  // then pad with a leading zero if necessary.
  const month = (date.getMonth() + 1)
    .toString()
    .padStart(2, "0")

  // getDate() returns the day of the month (1-31) for the local time zone,
  // padded with a leading zero if necessary.
  const day = date.getDate().toString().padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Example usage
const now = new Date()
const dateKey = toLocalIsoDateString(now)

console.log(dateKey) // e.g., "2025-10-11"
