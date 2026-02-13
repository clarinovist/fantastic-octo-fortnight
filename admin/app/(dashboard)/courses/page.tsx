import {
  Plus,
  Edit,
  Monitor,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCourses } from "@/services/course";
import { formatDate } from "@/utils/helpers/formatter";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 9;

  const { data: courses, metadata } = await getCourses({
    page,
    pageSize,
  });

  return (
    <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
      <PageHeader
        title="Courses"
        subtitle="Manage your course catalogue, assign tutors, and track student enrollment across all departments."
        action={{ label: "Create Course", href: "/courses/create", icon: Plus }}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              {/* Thumbnail Placeholder */}
              <div className="relative w-full h-48 bg-muted overflow-hidden bg-gradient-to-br from-violet-500/10 to-violet-500/5">
                <div className="absolute inset-0 flex items-center justify-center text-violet-200">
                  <Monitor className="size-16 opacity-20" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <StatusBadge status={course.status} showDot={false} />
                </div>
                {/* Type Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10 shadow-sm flex items-center gap-1.5">
                  {course.classType === 'online' ? <Monitor className="size-3 text-sky-500" /> : <MapPin className="size-3 text-orange-500" />}
                  <span className="text-xs font-bold text-foreground tracking-wide uppercase">
                    {course.classType}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col p-6 gap-4 flex-1">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                    {course.courseTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="size-4" />
                    <span className="text-sm font-medium">{course.tutorName}</span>
                  </div>
                </div>

                {/* Stats / Info Row */}
                <div className="flex items-center gap-6 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span className="text-xs">Updated {formatDate(course.updatedAt)}</span>
                  </div>
                  {course.isFreeFirstCourse && (
                    <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded">
                      Free Trial
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/30 flex items-center justify-end border-t border-border">
                <Link
                  href={`/courses/${course.id}`}
                  className="text-violet-600 hover:text-violet-700 text-sm font-semibold transition-colors flex items-center gap-1 hover:bg-violet-600/5 px-3 py-1.5 rounded-lg -mr-2"
                >
                  Edit details
                  <Edit className="size-4" />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <h3 className="text-lg font-semibold text-foreground mb-1">No courses found</h3>
            <p className="text-muted-foreground">Get started by creating your first course.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {metadata && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Pagination page={page} pageSize={pageSize} total={metadata.total} />
        </div>
      )}
    </div>
  );
}
