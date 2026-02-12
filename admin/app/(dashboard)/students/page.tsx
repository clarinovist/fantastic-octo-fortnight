import Link from "next/link";
import {
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getStudents } from "@/services/student";
import { formatDate } from "@/utils/helpers/formatter";

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Students
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Manage your student roster and monitor their progress.
          </p>
        </div>
        <Link
          href="/students/create"
          className="flex items-center justify-center gap-2 h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
        >
          <Plus className="size-5" />
          <span>Register Student</span>
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
              placeholder="Search students..."
              className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
            />
          </div>
          {/* Status Filter - Disabled for now as backend support unclear */}
          <div className="relative group min-w-[140px] opacity-50 pointer-events-none">
            <div className="relative">
              <select className="w-full h-10 pl-4 pr-10 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 appearance-none cursor-pointer hover:bg-muted/50 transition-colors">
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 pointer-events-none" />
            </div>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 pl-6 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-input text-violet-600 focus:ring-violet-600/20 h-4 w-4 bg-background"
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Student
                </th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Premium
                </th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="p-4 pr-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students && students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <input
                        type="checkbox"
                        className="rounded border-input text-violet-600 focus:ring-violet-600/20 h-4 w-4 bg-background"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                            {student.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground group-hover:text-violet-600 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${student.premiumSubscription === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700/50'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${student.premiumSubscription === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}></span>
                        {student.premiumSubscription || 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(student.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-muted-foreground hover:text-violet-600 p-2 rounded-lg hover:bg-violet-600/5 transition-colors">
                        <MoreVertical className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination represented */}
        {metadata && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card">
            <span className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{Math.ceil(metadata.total / pageSize)}</span> ({metadata.total} total)
            </span>
            <div className="flex gap-2">
              <Link
                href={`?page=${page > 1 ? page - 1 : 1}&q=${q}`}
                className={`p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronLeft className="size-4.5" />
              </Link>
              <Link
                href={`?page=${page + 1}&q=${q}`}
                className={`p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-violet-600 transition-colors ${page * pageSize >= metadata.total ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronRight className="size-4.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        © 2023 Lesprivate Admin Portal. All rights reserved.
      </div>
    </div>
  );
}
