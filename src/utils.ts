/* eslint-disable @typescript-eslint/no-explicit-any */

import type { LibraryInfo, AreaInfo, SeatInfo, DatedLibraryAvailability, LibraryAvailability, AreaId, SeatId, SeatAvailability, AreaAvailability } from "./types.js";

/**
 * Converts a LibraryInfo Map into a serializable object.
 * @param libraryInfo The Map to serialize.
 * @returns A JSON string representing the nested data structure.
 */
export function serializeLibraryInfo(libraryInfo: LibraryInfo): string {
    // Convert the top-level LibraryInfo Map to an array of [key, value] pairs.
    const serializableLibraries = Array.from(libraryInfo.entries()).map(([libraryId, libraryDetails]) => {
        // For each LibraryDetails object, convert its nested AreaInfo Map.
        const serializableAreas = Array.from(libraryDetails.areaInfo.entries()).map(([areaId, areaDetails]) => {
            // For each AreaDetails object, convert its nested SeatInfo Map.
            const serializableSeats = Array.from(areaDetails.seatInfo.entries());
            
            // Return the serializable AreaDetails object, converting Dates to ISO strings.
            return [areaId, {
                name: areaDetails.name,
                openingTime: areaDetails.openingTime.toISOString(), // Convert Date to a string
                closingTime: areaDetails.closingTime.toISOString(), // Convert Date to a string
                seatInfo: serializableSeats, // The seats are now an array
            }];
        });

        // Return the serializable LibraryDetails object with the array of areas.
        return [libraryId, {
            name: libraryDetails.name,
            areaInfo: serializableAreas,
        }];
    });

    // Finally, use JSON.stringify to convert the entire structure into a string.
    return JSON.stringify(serializableLibraries, null, 2);
}

/**
 * Converts a JSON string back into a typed LibraryInfo Map.
 * @param jsonString The JSON string to deserialize.
 * @returns A fully typed LibraryInfo Map.
 */
export function deserializeLibraryInfo(jsonString: string): LibraryInfo {
    // Parse the JSON string back into a nested array structure.
    const parsedData = JSON.parse(jsonString);

    // Rebuild the top-level LibraryInfo Map.
    const libraryInfo: LibraryInfo = new Map(parsedData.map(([libraryId, libraryDetails]: any) => {
        // Rebuild the nested AreaInfo Map.
        const areaInfo: AreaInfo = new Map(libraryDetails.areaInfo.map(([areaId, areaDetails]: any) => {
            // Rebuild the nested SeatInfo Map.
            const seatInfo: SeatInfo = new Map(areaDetails.seatInfo);

            // Return the AreaDetails object, converting ISO strings back to Dates.
            return [areaId, {
                name: areaDetails.name,
                openingTime: new Date(areaDetails.openingTime), // Convert string to Date
                closingTime: new Date(areaDetails.closingTime), // Convert string to Date
                seatInfo: seatInfo,
            }];
        }));

        // Return the LibraryDetails object with the AreaInfo Map.
        return [libraryId, {
            name: libraryDetails.name,
            areaInfo: areaInfo,
        }];
    }));
    
    return libraryInfo;
}

/**
 * Converts a DatedLibraryAvailability tuple into a JSON string.
 * @param data The DatedLibraryAvailability tuple to serialize.
 * @returns A JSON string representing the data structure.
 */
export function serializeDatedLibraryAvailability(data: DatedLibraryAvailability): string {
    // Extract the Date and the LibraryAvailability Map
    const [date, libraryAvailability] = data;

    // Convert the top-level LibraryAvailability Map to a serializable object.
    const serializableLibraryAvailability = Array.from(libraryAvailability.entries()).map(([areaId, areaAvailability]) => {
        // Convert the nested AreaAvailability Map to an array of entries.
        const serializableAreaAvailability = Array.from(areaAvailability.entries());

        // Return a serializable tuple for each area.
        return [areaId, serializableAreaAvailability];
    });

    // Create the final serializable object.
    // The date is converted to an ISO string for serialization.
    const serializableData = [
        date.toISOString(), 
        serializableLibraryAvailability
    ];

    return JSON.stringify(serializableData, null, 2);
}

/**
 * Converts a JSON string back into a typed DatedLibraryAvailability tuple.
 * @param jsonString The JSON string to deserialize.
 * @returns A fully typed DatedLibraryAvailability tuple.
 */
export function deserializeDatedLibraryAvailability(jsonString: string): DatedLibraryAvailability {
    // Parse the JSON string back into a nested array structure.
    const parsedData = JSON.parse(jsonString);

    // Extract the serialized date and library availability data.
    const [dateString, serializedLibraryAvailability] = parsedData;

    // Rebuild the top-level LibraryAvailability Map.
    const libraryAvailability: LibraryAvailability = new Map(
        serializedLibraryAvailability.map(([areaId, areaAvailability]: [AreaId, [SeatId, SeatAvailability][]]) => {
            // Rebuild the nested AreaAvailability Map.
            const newAreaAvailability: AreaAvailability = new Map(areaAvailability);

            return [areaId, newAreaAvailability];
        })
    );

    // Reconstruct the Date object from its string representation.
    const date = new Date(dateString);

    // Return the final tuple with the correct types.
    return [date, libraryAvailability];
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
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}