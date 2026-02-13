import {
    TrendingUp,
    TrendingDown,
    Landmark,
    Hash,
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Download,
    Plus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminTransactions, getAdminTransactionStats } from "@/services/finance";
import { formatDate } from "@/utils/helpers/formatter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: { page?: string; tutorName?: string; type?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const tutorName = searchParams.tutorName || "";
    const type = searchParams.type || "all";
    const pageSize = 10;

    const [transactionsResp, statsResp] = await Promise.all([
        getAdminTransactions({ page, pageSize, tutorName, type }),
        getAdminTransactionStats(),
    ]);

    const transactions = transactionsResp.data || [];
    const metadata = transactionsResp.metadata;
    const stats = statsResp.data || {
        total_credit: 0,
        total_debit: 0,
        total_commission: 0,
        total_count: 0,
    };

    return (
        <div className="mx-auto max-w-[1440px] flex flex-col gap-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Transactions"
                    subtitle="Monitor all financial movements within the Lesprivate ecosystem."
                />
                <div className="flex items-center gap-3">
                    <button className="bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors shadow-sm">
                        <Download className="size-4" />
                        Export CSV
                    </button>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                        <Plus className="size-4" />
                        New Adjustment
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Credit */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-[10px] font-bold">
                            Incoming
                        </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Total Credit</p>
                    <h3 className="text-xl font-bold mt-1">{formatCurrency(stats.total_credit)}</h3>
                    <div className="mt-4 h-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                    </div>
                </div>

                {/* Total Debit */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingDown className="size-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded text-[10px] font-bold">
                            Outgoing
                        </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Total Debit</p>
                    <h3 className="text-xl font-bold mt-1">{formatCurrency(stats.total_debit)}</h3>
                    <div className="mt-4 h-1 bg-rose-100 dark:bg-rose-900/20 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-full"></div>
                    </div>
                </div>

                {/* Net Commission */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Landmark className="size-5 text-primary" />
                        </div>
                        <span className="text-primary bg-primary/10 px-2 py-1 rounded text-[10px] font-bold">
                            Revenue
                        </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Net Commission</p>
                    <h3 className="text-xl font-bold mt-1">{formatCurrency(stats.total_commission)}</h3>
                    <div className="mt-4 h-1 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full"></div>
                    </div>
                </div>

                {/* Total Count */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-muted rounded-lg group-hover:scale-110 transition-transform">
                            <Hash className="size-5 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-[10px] font-bold">
                            Transactions
                        </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Total Count</p>
                    <h3 className="text-xl font-bold mt-1">{stats.total_count.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-1">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-primary opacity-20 w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <form method="get">
                            <input
                                name="tutorName"
                                className="w-full h-10 pl-10 pr-4 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="Search by Tutor Name..."
                                defaultValue={tutorName}
                            />
                        </form>
                    </div>

                    <div className="relative group min-w-[150px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="size-4 text-muted-foreground" />
                        </div>
                        <select
                            className="w-full h-10 pl-9 pr-8 bg-background border border-border rounded-lg text-sm text-foreground appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                            defaultValue={type}
                        >
                            <option value="all">All Types</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 border-l border-border pl-4">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <button className="text-sm font-medium text-foreground flex items-center gap-1 hover:text-primary transition-colors group">
                        Newest First
                        <ArrowUpDown className="size-4 group-hover:rotate-180 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tutor</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9 border bg-muted shadow-sm">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${tx.tutor_email}`} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                        {tx.tutor_name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="font-bold text-sm text-foreground">{tx.tutor_name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{tx.tutor_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tx.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold capitalize">
                                                {tx.reference_type.replace(/_/g, " ")}
                                            </div>
                                            <div className="text-[10px] font-mono text-muted-foreground uppercase">
                                                #{tx.reference_id.substring(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-foreground">
                                                {formatCurrency(tx.amount)}
                                            </div>
                                            {parseFloat(tx.commission.toString()) > 0 && (
                                                <div className="text-[10px] text-primary font-medium">
                                                    Fee: {formatCurrency(tx.commission)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-foreground font-medium">
                                                {formatDate(tx.created_at).split(",")[0]}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <p className="text-xs text-muted-foreground truncate" title={tx.description}>
                                                {tx.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                                                <Hash className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-bold">No transactions found</p>
                                            <p className="text-xs text-muted-foreground/70">Try adjusting your filters to find what you&apos;re looking for.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {metadata && (
                    <div className="border-t border-border">
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={metadata.total}
                            queryParams={{ tutorName, type }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
