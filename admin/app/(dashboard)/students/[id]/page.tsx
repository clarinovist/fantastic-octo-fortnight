import { MainLayout } from "@/components/layout/main-layout";
import { StudentDetails } from "@/components/student/student-detail";
import { getStudentById } from "@/services/student";

type DetailStudentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DetailStudentPage(
  pageProps: DetailStudentPageProps
) {
  const { id } = await pageProps.params;
  const student = await getStudentById(id);
  return (
    <MainLayout
      title="Student Details"
      breadcrumbs={[
        {
          label: "List Student",
          href: "/students",
        },
      ]}
    >
      <div className="@container/main p-4">
        <StudentDetails student={student.data} />
      </div>
    </MainLayout>
  );
}
