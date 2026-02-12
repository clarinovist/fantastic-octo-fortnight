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
  );
}
