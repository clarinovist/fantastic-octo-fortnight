import { Card, CardContent } from "@/components/ui/card"
import { CustomSwitch } from "@/components/ui/custom-switch"
import { COURSE_STATUS } from "@/utils/constants"
import { MyCourseResponse } from "@/utils/types/account"
import { Check, FileText, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

type CourseItemProps = {
  course: MyCourseResponse
}

export function CourseItem({ course }: CourseItemProps) {
  const [isPublished, setIsPublished] = useState(course.isPublished)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isDraft = course.status === COURSE_STATUS.DRAFT
  const isWaitingForApproval = course.status === COURSE_STATUS.WAITING_FOR_APPROVAL
  const isAccepted = course.status === COURSE_STATUS.ACCEPTED
  const isRejected = course.status === COURSE_STATUS.REJECTED

  const getStatusIcon = () => {
    if (isAccepted) return <Check size={14} />
    if (isRejected) return <X size={14} />
    if (isWaitingForApproval) return <Loader2 size={14} className="animate-spin" />
    return <FileText size={14} />
  }

  const getStatusColor = () => {
    if (isDraft) return "bg-black"
    if (isWaitingForApproval) return "bg-[#B4B4B4]"
    if (isAccepted) return "bg-[#006312]"
    if (isRejected) return "bg-[#A70000]"
    return "bg-gray-600"
  }

  const footerStatus = (status: string) => {
    return (
      <div
        className={`text-white text-xs flex items-center px-4 py-2 ${getStatusColor()} space-x-2`}
      >
        {getStatusIcon()}
        <span className="font-semibold">{status}</span>
      </div>
    )
  }

  const handlePublishChange = async (value: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/courses/${course.id}/publish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: value }),
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error("Failed to update publish state")
      setIsPublished(value)
      toast.success("Course publish state updated")
      window.location.reload()
    } catch (e) {
      toast.error("Failed to update publish state")
      // Revert the local state on error
      setIsPublished(!value)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error("Failed to delete course")
      toast.success("Course deleted successfully")
      window.location.reload()
    } catch (e) {
      toast.error("Failed to delete course")
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">ARE YOU SURE?</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the class &quot;{course.title}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex-1"
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-main text-white rounded hover:bg-main/50 flex-1 flex items-center justify-center"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="rounded-2xl overflow-hidden p-0">
        <CardContent className="pt-4 px-6 flex flex-col md:flex-row justify-between space-y-2">
          <div>
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
          </div>
          <div className="flex md:flex-col gap-4 mt-2">
            <div className="flex items-center space-x-4 text-gray-500 uppercase text-xs">
              <span className="font-bold text-[#8E8E8E]">Publish</span>
              <div className="flex items-center space-x-1">
                <CustomSwitch
                  disabled={isDraft || isWaitingForApproval || isRejected || loading}
                  checked={isPublished}
                  onChange={handlePublishChange}
                />
                {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
              </div>
            </div>
            <div className="space-x-4 flex">
              <button
                className="text-red-600 font-semibold flex items-center"
                onClick={handleDeleteClick}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
                DELETE
              </button>
              <Link
                href={`/account/course/${course.id}/preview`}
                className="text-blue-600 font-semibold"
              >
                DETAIL
              </Link>
            </div>
          </div>
        </CardContent>
        {footerStatus(course.status)}
      </Card>
    </>
  )
}
