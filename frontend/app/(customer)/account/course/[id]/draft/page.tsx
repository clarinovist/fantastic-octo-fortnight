import { CourseManagementContainer } from "@/components/brand/course/management/course-management-container"
import { ManagementForm } from "@/components/brand/course/management/management-form"
import { getCourseSavedById } from "@/services/course"
import { notFound } from "next/navigation"

export default async function AccountCourseFormPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const { data: detail } = await getCourseSavedById(id)
  if (!id || !detail) {
    return notFound()
  }
  const detailData = detail?.draft ? detail?.draft : { ...detail }
  return (
    <CourseManagementContainer detail={detail}>
      <ManagementForm detail={detailData!} />
    </CourseManagementContainer>
  )
}
