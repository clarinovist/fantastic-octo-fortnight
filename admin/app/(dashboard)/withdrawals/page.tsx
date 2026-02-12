import {
    Filter,
    ChevronDown,
    ArrowUpDown,
    CreditCard,
    Building2,
    Calendar,
    User,
} from "lucide-react";
import Link from "next/link";
import { getAdminWithdrawals } from "@/services/finance";
import { formatDate } from "@/utils/helpers/formatter";
import { WithdrawalActions } from "@/components/withdrawals/withdrawal-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default async function WithdrawalsPage({
    searchParams,
}: {
    searchParams: { page?: string; status?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const status = searchParams.status || "all";
    const pageSize = 10;

    const { data: withdrawals, metadata } = await getAdminWithdrawals({
        page,
        pageSize,
        status,
    });

    return (
        <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                        Withdrawals
                    </h1>
                    <p className="text-muted-foreground text-base max-w-2xl">
                        Manage mentor withdrawal requests, review financial details, and process payouts.
                    </p>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Left Side: Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                    {/* Status Filter */}
                    <div className="relative group min-w-[180px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="size-4 text-muted-foreground" />
                        </div>
                        <select
                            className="w-full h-10 pl-9 pr-8 bg-background border border-border rounded-lg text-sm text-foreground appearance-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all cursor-pointer"
                            defaultValue={status}
                        // Basic client-side navigation using form submission or just let user manually navigate (for simplicity here, we rely on standard link behavior if we wrap in form, or just use onChange with router in client component. Since this is server component, we can use a simple form with GET method)
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="size-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>

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
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                                    Mentor
                                </th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[20%]">
                                    Bank Details
                                </th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                                    Amount
                                </th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                                    Requested Date
                                </th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right w-[10%]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {withdrawals && withdrawals.length > 0 ? (
                                withdrawals.map((item) => (
                                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border bg-muted">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${item.tutor?.email || 'mentor'}`} />
                                                    <AvatarFallback className="bg-violet-100 text-violet-600 font-bold text-xs">
                                                        {item.tutor?.name?.substring(0, 2).toUpperCase() || "M"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground text-sm">
                                                        {item.tutor?.name || "Unknown Mentor"}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                        {item.tutor?.email}
                                                    </span>
                                                    <span className="text-muted-foreground text-[10px] bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                                                        {item.tutor?.phone_number || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold flex items-center gap-1.5">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {item.bank_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {item.account_number}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {item.account_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-bold text-foreground">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge
                                                variant="outline"
                                                className={`capitalize ${item.status.toLowerCase() === "approved" || item.status.toLowerCase() === "completed"
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                    : item.status.toLowerCase() === "rejected" || item.status.toLowerCase() === "failed"
                                                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                                        : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30"
                                                    }`}
                                            >
                                                {item.status}
                                            </Badge>
                                            {item.admin_note && (
                                                <div className="mt-1 text-[10px] text-red-500 max-w-[150px] leading-tight">
                                                    Note: {item.admin_note}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col text-sm text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {formatDate(item.created_at).split(',')[0]}
                                                </span>
                                                <span className="text-xs text-muted-foreground pl-5">
                                                    {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <WithdrawalActions id={item.id} status={item.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                                                <CreditCard className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">No withdrawal requests found.</p>
                                            <p className="text-sm text-muted-foreground/70">Try adjusting your filters or search terms.</p>
                                        </div>
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
                                href={`?page=${page > 1 ? page - 1 : 1}&status=${status}`}
                                className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                Previous
                            </Link>
                            <Link
                                href={`?page=${page + 1}&status=${status}`}
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
