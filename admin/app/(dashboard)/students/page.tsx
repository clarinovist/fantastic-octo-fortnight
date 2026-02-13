import Link from "next/link";
import {
  Plus,
  MoreVertical,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
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
      <PageHeader
        title="Students"
        subtitle="Manage your student roster and monitor their progress."
        action={{ label: "Register Student", href: "/students/create", icon: Plus }}
      />

      <SearchToolbar
        placeholder="Search students..."
        queryParamName="q"
        defaultQuery={q}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { value: "all", label: "Status: All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            disabled: true,
          },
        ]}
      />

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
                      <StatusBadge status={student.premiumSubscription || "Inactive"} />
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

        {metadata && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={metadata.total}
            queryParams={{ q }}
          />
        )}
      </div>
    </div>
  );
}
