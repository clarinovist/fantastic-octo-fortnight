"use client";

import type { TutorCourse } from "@/utils/types";
import { Edit2, Trash2 } from "lucide-react";

type TutorCoursesProps = {
  courses: TutorCourse[];
};

export default function TutorCourses({ courses }: TutorCoursesProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        courses
      </h3>
      <div className="space-y-4">
        {courses.length === 0 && (
          <p className="text-sm text-foreground">
            no courses available yet
          </p>
        )}
        {courses.map((course) => (
          <div
            key={course.id}
            className="space-y-3 bg-muted p-4 rounded-md"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">
                {course.title}
              </p>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-background rounded transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1.5 hover:bg-background rounded transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                status
              </p>
              <p className="text-sm text-foreground capitalize">
                {course.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
