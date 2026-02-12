import { Badge } from "@/components/ui/badge";
import type { CourseDetail } from "@/utils/types";
import { User } from "lucide-react";
import Image from "next/image";

type DetailCourseTutorProps = {
  variant?: "mobile" | "desktop";
  course: CourseDetail;
};

export function DetailCourseTutor({ variant, course }: DetailCourseTutorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={
          variant === "desktop"
            ? "w-40 h-40 shrink-0 relative"
            : "relative w-full aspect-square"
        }
      >
        {variant === "desktop" && course.tutor.photoProfile ? (
          <Image
            src={course.tutor.photoProfile}
            alt="Tutor"
            className="w-full h-full object-cover rounded-lg"
            width={160}
            height={160}
          />
        ) : variant === "mobile" && course.tutor.photoProfile ? (
          <Image
            src={course.tutor.photoProfile}
            alt="Tutor"
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
            <User className="w-20 h-20 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h2
          className={`font-bold text-center ${
            variant === "mobile" ? "text-2xl" : "text-xl"
          }`}
        >
          {course.tutor.name}
        </h2>
        <div className="flex flex-wrap gap-1 mt-2">
          {course.relatedCourses.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`bg-gray-100 text-[#7000FE] font-bold ${
                variant === "mobile" ? "" : "text-xs"
              }`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
