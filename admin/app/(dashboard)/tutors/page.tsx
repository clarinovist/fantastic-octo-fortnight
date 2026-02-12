import { MainLayout } from "@/components/layout/main-layout";
import { TutorList } from "@/components/tutor/tutor-list";
import { getTutors } from "@/services/tutor";
import { getSearchParamValue } from "@/utils/helpers";

type TutorsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TutorsPage({ searchParams }: TutorsPageProps) {
  const query = await searchParams;
  const page = getSearchParamValue(query.page, 1);
  const pageSize = getSearchParamValue(query.pageSize, 10);
  const q = getSearchParamValue(query.q, "");
  const sort = getSearchParamValue(query.sort, "");
  const sortDirection = getSearchParamValue(query.sortDirection, "");

  const { data, metadata } = await getTutors({
    page,
    pageSize,
    q,
    sort,
    sortDirection,
  });

  return (
    <MainLayout title="Tutors">
      <div className="@container/main p-4">
        <TutorList
          tutors={data || []}
          totalData={metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
  );
}
