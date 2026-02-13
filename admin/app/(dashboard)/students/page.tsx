import { Plus } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StudentTable } from "@/components/student/student-table";
import { getStudents } from "@/services/student";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const pageSize = 10;

  const { data: students, metadata } = await getStudents({
    page,
    pageSize,
    q,
  });

  return (
    <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
      <PageHeader
        title="Students"
        subtitle="Manage your student roster and monitor their progress."
        action={{ label: "Register Student", href: "/students/create", icon: Plus }}
      />

      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading students...</div>}>
        <StudentTable
          students={students || []}
          totalData={metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
