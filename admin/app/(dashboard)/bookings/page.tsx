import {
  Calendar,
  Filter,
  Layout,
  List,
  MoreVertical,
  Plus,
  Download,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { getBookings } from "@/services/booking";
import { type Booking, type Metadata } from "@/utils/types";
import { formatDate } from "@/utils/helpers/formatter";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; view?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const view = (searchParams.view as "list" | "kanban") || "list";
  const pageSize = 10;

  const { data: bookings, metadata } = await getBookings({
    page,
    pageSize: 100,
    studentName: q,
  });

  return (
    <div className="mx-auto max-w-[1440px] flex flex-col h-[calc(100vh-100px)] gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Bookings"
          subtitle="Manage and track all tutoring sessions, payments, and statuses."
          action={{ label: "New Booking", href: "/bookings/create", icon: Plus }}
        >
          {/* View Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
            <Link
              href={`?view=list&page=${page}&q=${q}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <List className="size-4" />
              <span>List</span>
            </Link>
            <Link
              href={`?view=kanban&page=${page}&q=${q}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "kanban"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Layout className="size-4" />
              <span>Kanban</span>
            </Link>
          </div>

          <button className="flex items-center gap-2 h-10 px-4 bg-background border border-border rounded-lg text-foreground text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm">
            <Filter className="size-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </PageHeader>

        <SearchToolbar
          placeholder="Search bookings..."
          queryParamName="q"
          defaultQuery={q}
        >
          <button type="button" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-medium transition-colors">
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </SearchToolbar>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {view === "list" ? (
          <ListView bookings={bookings} metadata={metadata || { total: 0, page: 1, pageSize: 10 }} page={page} pageSize={pageSize} q={q} />
        ) : (
          <KanbanView bookings={bookings} />
        )}
      </div>
    </div>
  );
}

function ListView({ bookings, metadata, page, pageSize, q }: { bookings: Booking[]; metadata: Metadata; page: number; pageSize: number; q: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[240px]">Participants</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Course</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[180px]">Schedule</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-muted-foreground">#{booking.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {booking.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{booking.studentName}</p>
                          <p className="text-xs text-muted-foreground">Student</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                          {booking.tutorName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{booking.tutorName}</p>
                          <p className="text-xs text-muted-foreground">Tutor</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1.5 pt-1">
                      <p className="text-sm font-semibold text-foreground">{booking.courseTitle}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1 pt-1">
                      <div className="flex items-center gap-2 text-foreground text-sm font-medium">
                        <Calendar className="size-4 text-muted-foreground" />
                        {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top pt-5">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 align-top pt-4 text-right">
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <MoreVertical className="size-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No bookings found.
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
          queryParams={{ view: "list", q }}
        />
      )}
    </div>
  );
}

function KanbanView({ bookings }: { bookings: Booking[] }) {
  const columns = {
    pending: bookings?.filter(b => b.status === 'pending') || [],
    accepted: bookings?.filter(b => b.status === 'accepted') || [],
    cancelled: bookings?.filter(b => b.status === 'declined' || b.status === 'expired') || [],
  };

  return (
    <div className="h-full overflow-x-auto p-6 scrollbar-hide">
      <div className="flex h-full gap-6 min-w-[1200px]">
        {/* Column: Pending */}
        <div className="flex flex-col w-80 shrink-0 h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Pending</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-bold">{columns.pending.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {columns.pending.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>

        {/* Column: Accepted */}
        <div className="flex flex-col w-80 shrink-0 h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Accepted</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-bold">{columns.accepted.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {columns.accepted.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>

        {/* Column: Cancelled/Declined */}
        <div className="flex flex-col w-80 shrink-0 h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Cancelled</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-bold">{columns.cancelled.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {columns.cancelled.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
            {booking.studentName.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">{booking.studentName}</span>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-[10px] font-bold">
            {booking.tutorName.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">{booking.tutorName}</span>
        </div>
      </div>
      <h4 className="text-base font-bold text-foreground mb-3">{booking.courseTitle}</h4>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-4" />
          <span className="text-xs font-medium">{formatDate(booking.bookingDate)}</span>
        </div>
        <StatusBadge status={booking.status} showDot={false} />
      </div>
    </div>
  )
}
