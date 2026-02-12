import { Preview } from "@/components/brand/course/management/preview"
import { getCourseSavedById } from "@/services/course"
import { notFound } from "next/navigation"

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const { data: detail } = await getCourseSavedById(id)
  if (!id || !detail) {
    return notFound()
  }
  return <Preview detail={detail} />
}
