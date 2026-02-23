import { BookingCourse } from "@/components/brand/course/booking/booking-course"
import { LayoutCustomer } from "@/components/brand/layout-customer"
import { getBookedDate, getCourseById } from "@/services/course"

type BookingPageProps = {
  params: Promise<{ id: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params
  const { data } = await getCourseById(id)
  // Get booked dates for the next 2 weeks
  const now = new Date()
  const twoWeeksLater = new Date()
  twoWeeksLater.setDate(now.getDate() + 13)

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const bookedDate = await getBookedDate({
    id,
    startDate: formatDate(now),
    endDate: formatDate(twoWeeksLater),
  })
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_GOOGLE_KEY || ""
  return (
    <LayoutCustomer isShowSidebar isShowBackButton wrapperHeaderChildrenClassName="h-screen">
      <BookingCourse detail={data} apiKey={apiKey} availableDates={bookedDate.data} />
    </LayoutCustomer>
  )
}
