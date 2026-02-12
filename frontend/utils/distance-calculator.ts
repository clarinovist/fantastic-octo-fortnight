/**
 * Calculate distance between two points using Haversine formula
 * @param lt1 Latitude of point 1
 * @param lg1 Longitude of point 1
 * @param lt2 Latitude of point 2
 * @param lg2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lt1: string | number, 
  lg1: string | number, 
  lt2: string | number, 
  lg2: string | number
): number {
  const lat1 = Number(lt1)
  const lat2 = Number(lt2)
  const lng1 = Number(lg1)
  const lng2 = Number(lg2)
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}