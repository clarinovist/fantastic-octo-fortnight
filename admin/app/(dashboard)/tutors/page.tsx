import { Plus } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TutorTable } from "@/components/tutor/tutor-table";
import { getTutors } from "@/services/tutor";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const pageSize = 10;

  const { data: tutors, metadata } = await getTutors({
    page,
    pageSize,
    q,
  });

  return (
    <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
      <PageHeader
        title="Tutors"
        subtitle="Manage your tutor roster, track performance, and update credentials effectively."
        action={{ label: "Add Tutor", href: "/tutors/create", icon: Plus }}
      />

      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading tutors...</div>}>
        <TutorTable
          tutors={tutors || []}
          totalData={metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
