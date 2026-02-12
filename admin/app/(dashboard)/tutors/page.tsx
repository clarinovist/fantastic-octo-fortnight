import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Shapes,
} from "lucide-react";
import Link from "next/link";
import { getTutors } from "@/services/tutor";
import { formatDate } from "@/utils/helpers/formatter";

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

      {/* Filters & Controls */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Left Side: Search & Filters */}
        <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
            />
          </div>
          {/* Status Filter */}
          <div className="relative group min-w-[140px] opacity-50 pointer-events-none">
            <button className="w-full h-10 px-3 bg-background border border-border rounded-lg flex items-center justify-between text-sm text-foreground hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Filter className="size-4.5" />
                <span className="text-foreground">Status</span>
              </span>
              <ChevronDown className="size-4.5 text-muted-foreground" />
            </button>
          </div>
          {/* Subject Filter */}
          <div className="relative min-w-[160px] opacity-50 pointer-events-none">
            <button className="w-full h-10 px-3 bg-background border border-border rounded-lg flex items-center justify-between text-sm text-foreground hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Shapes className="size-4.5" />
                <span className="text-foreground">Subjects</span>
              </span>
              <ChevronDown className="size-4.5 text-muted-foreground" />
            </button>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>

        {/* Right Side: View Toggle / Sort */}
        <div className="hidden sm:flex items-center gap-2 border-l border-border pl-4">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <button className="text-sm font-medium text-foreground flex items-center gap-1 hover:text-violet-600 transition-colors">
            Newest First
            <ArrowUpDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[35%]">
                  Tutor
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                  Phone
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                  Joined Date
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tutors && tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <tr key={tutor.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {tutor.photoProfile ? (
                          <div
                            className="size-10 rounded-full bg-muted shrink-0 bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${tutor.photoProfile}")`,
                            }}
                          ></div>
                        ) : (
                          <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                            {tutor.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {tutor.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {tutor.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tutor.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/30 dark:text-zinc-400 dark:border-zinc-700/50'
                        }`}>
                        <span className={`size-1.5 rounded-full ${tutor.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                        {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-foreground">
                        {tutor.phoneNumber || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-foreground">{formatDate(tutor.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No tutors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {metadata && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
            <div className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{Math.ceil(metadata.total / pageSize)}</span> ({metadata.total} total)
            </div>
            <div className="flex gap-2">
              <Link
                href={`?page=${page > 1 ? page - 1 : 1}&q=${q}`}
                className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Previous
              </Link>
              <Link
                href={`?page=${page + 1}&q=${q}`}
                className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${page * pageSize >= metadata.total ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
