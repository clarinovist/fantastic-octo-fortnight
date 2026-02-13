import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { TutorList } from "@/components/tutor/tutor-list";
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Tutors
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Manage your tutor roster, track performance, and update credentials effectively.
          </p>
        </div>
        <Link
          href="/tutors/create"
          className="flex items-center justify-center gap-2 h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
        >
          <Plus className="size-5" />
          <span>Add Tutor</span>
        </Link>
      </div>

      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading tutors...</div>}>
        <TutorList
          tutors={tutors || []}
          totalData={metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
