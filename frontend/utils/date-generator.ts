export function generateDates() {
  const locale = "id-ID"
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long" })
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long" })

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + 13) // two weeks ahead

  const out: {
    day: string
    date: string
    month: string
    shortMonth: string
    isAvailable: boolean
    fullDate: string
  }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const current = new Date(d)
    // Fix timezone issue by formatting date manually instead of using toISOString
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, "0")
    const day = String(current.getDate()).padStart(2, "0")
    const fullDate = `${year}-${month}-${day}`

    out.push({
      day: dayFmt.format(current), // e.g. "Senin"
      date: String(current.getDate()), // e.g. "20"
      month: monthFmt.format(current), // e.g. "Agustus"
      shortMonth: monthFmt.format(current).slice(0, 3),
      isAvailable: current.getTime() >= today.getTime(),
      fullDate: fullDate, // e.g. "2024-09-08"
    })
  }
  return out
}