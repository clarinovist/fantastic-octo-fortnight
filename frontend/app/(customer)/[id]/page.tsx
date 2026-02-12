import { DetailCourse } from "@/components/brand/course/detail/detail-course"
import { LayoutCustomer } from "@/components/brand/layout-customer"
import { getBookedDate, getCourseById, getCourseRecommendations } from "@/services/course"
import { notFound } from "next/navigation"

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const { data } = await getCourseById(id)
  if (!data) {
    return notFound()
  }

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
  const recommendations = getCourseRecommendations(id)

  return (
    <LayoutCustomer
      isShowSidebar
      isShowNotification
      isShowBackButton
      wrapperHeaderChildrenClassName="h-screen"
    >
      <DetailCourse
        course={data}
        isBookable
        recommendations={recommendations}
        availableDates={bookedDate.data}
      />
    </LayoutCustomer>
  )
}
