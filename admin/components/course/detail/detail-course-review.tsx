import { Card } from "@/components/ui/card"
import type { CourseDetail } from "@/utils/types"
import { User } from "lucide-react"
import Image from "next/image"

type DetailCourseReviewProps = {
  variant?: "mobile" | "desktop"
  course: CourseDetail
}

export function DetailCourseReview({ course }: DetailCourseReviewProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-lg font-bold">ULASAN</h1>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-bold text-black ml-1">{course.tutor.rating}</span>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-6 bg-[#EDEDED] p-4 rounded-3xl max-h-[450px] overflow-y-auto">
        {course.tutor.ratings.length === 0 && (
          <p className="text-sm text-center text-gray-500">Belum ada ulasan untuk kursus ini.</p>
        )}
        {course.tutor.ratings.map((review, idx) => (
          <Card key={idx} className="p-6 bg-white rounded-3xl shadow-sm border-0">
            <div className="flex items-start gap-4">
              {review.studentPhoto ? (
                <Image
                  src={review.studentPhoto}
                  alt={review.studentName ?? "Profile"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-black">
                  {review?.studentName || review?.studentEmail}
                </h3>
                <p className="text-black text-base leading-relaxed">{review.review}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
