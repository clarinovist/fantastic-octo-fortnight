import { Badge } from "@/components/ui/badge"
import type { CourseDetail } from "@/utils/types"

type DetailCourseDescriptionProps = {
  variant?: "mobile" | "desktop"
  course: CourseDetail
}

export function DetailCourseDescription({ course }: DetailCourseDescriptionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold">TENTANG KURSUS</h3>
        <div className="flex gap-1">
          {course.levelEducationCourse?.map(level => (
            <Badge key={level} variant="secondary" className="bg-[#7000FE]/50 text-white font-bold">
              {level}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-pretty">{course.description}</p>
    </div>
  )
}
