import { MainLayout } from "@/components/layout/main-layout";
import { StudentList } from "@/components/student/student-list";
import { getStudents } from "@/services/student";
import { getSearchParamValue } from "@/utils/helpers";

type StudentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const query = await searchParams;
  const page = getSearchParamValue(query.page, 1);
  const pageSize = getSearchParamValue(query.pageSize, 10);
  const q = getSearchParamValue(query.q, "");
  const sort = getSearchParamValue(query.sort, "");
  const sortDirection = getSearchParamValue(query.sortDirection, "");

  const { data, metadata } = await getStudents({
    page,
    pageSize,
    q,
    sort,
    sortDirection,
  });

  return (
    <MainLayout title="Students">
      <div className="@container/main p-4">
        <StudentList
          students={data || []}
          totalData={metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
  );
}
