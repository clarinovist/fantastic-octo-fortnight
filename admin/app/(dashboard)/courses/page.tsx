<<<<<<< HEAD
import { CourseList } from "@/components/course/course-list";
import { MainLayout } from "@/components/layout/main-layout";
import { getCourses } from "@/services/course";
import { getSearchParamValue } from "@/utils/helpers";
import { ClassType, CourseStatus } from "@/utils/types";

type CoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const query = await searchParams;
  const page = getSearchParamValue(query.page, 1);
  const pageSize = getSearchParamValue(query.pageSize, 10);
  const status = getSearchParamValue(query.status, "");
  const classType = getSearchParamValue(query.classType, "");
  const isFreeFirstCourse = getSearchParamValue(query.isFreeFirstCourse, "");
  const sort = getSearchParamValue(query.sort, "updated_at");
  const sortDirection = getSearchParamValue(query.sortDirection, "DESC");

  const courses = await getCourses({
    page,
    pageSize,
    status: status as CourseStatus,
    classType: classType as ClassType,
    isFreeFirstCourse:
      isFreeFirstCourse === "" ? undefined : isFreeFirstCourse === "true",
    sort,
    sortDirection,
  });

  return (
    <MainLayout title="Courses">
      <div className="@container/main p-4">
        <CourseList
          courses={courses.data}
          totalData={courses.metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
=======
import {
  Plus,
  Edit,
  Monitor,
  MapPin,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getCourses } from "@/services/course";
import { formatDate } from "@/utils/helpers/formatter";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 9; // Grid layout usually works better with multiples of 3

  const { data: courses, metadata } = await getCourses({
    page,
    pageSize,
  });

  return (
    <div className="mx-auto max-w-[1600px] flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Courses
          </h1>
          <p className="text-muted-foreground text-lg font-normal max-w-2xl">
            Manage your course catalogue, assign tutors, and track student enrollment across all departments.
          </p>
        </div>
        <Link
          href="/courses/create"
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-11 px-6 shadow-lg shadow-violet-600/20 transition-all active:scale-95 group"
        >
          <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-bold tracking-wide">Create Course</span>
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              {/* Thumbnail Placeholder - Since API doesn't provide image yet */}
              <div className="relative w-full h-48 bg-muted overflow-hidden bg-gradient-to-br from-violet-500/10 to-violet-500/5">
                <div className="absolute inset-0 flex items-center justify-center text-violet-200">
                  <Monitor className="size-16 opacity-20" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10 shadow-sm">
                  <span className={`text-xs font-bold tracking-wide uppercase ${course.status === 'Accepted' ? 'text-emerald-600' :
                      course.status === 'Waiting for Approval' ? 'text-amber-600' :
                        course.status === 'Draft' ? 'text-zinc-500' :
                          'text-red-600'
                    }`}>
                    {course.status}
                  </span>
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
        <div className="flex items-center justify-between py-4 mt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{Math.ceil(metadata.total / pageSize)}</span> ({metadata.total} total)
          </div>
          <div className="flex gap-2">
            <Link
              href={`?page=${page > 1 ? page - 1 : 1}`}
              className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-1">
                <ChevronLeft className="size-4" />
                Previous
              </span>
            </Link>
            <Link
              href={`?page=${page + 1}`}
              className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${page * pageSize >= metadata.total ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-1">
                Next
                <ChevronRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
>>>>>>> 1a19ced (chore: update service folders from local)
  );
}
