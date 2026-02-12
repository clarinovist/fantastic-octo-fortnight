/**
 * Converts a day number to Indonesian day name
 * @param dayNumber - Number from 1 (Monday) to 7 (Sunday)
 * @returns Indonesian day name
 */
export function getDayName(dayNumber: string | number): string {
  const dayMap: Record<string, string> = {
    "1": "Senin",
    "2": "Selasa",
    "3": "Rabu",
    "4": "Kamis",
    "5": "Jumat",
    "6": "Sabtu",
    "7": "Minggu",
  };

  return dayMap[dayNumber.toString()] || dayNumber.toString();
}