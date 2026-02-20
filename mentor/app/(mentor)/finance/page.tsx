"use client";

import {
    ArrowUpRight,
    Wallet,
    Calendar,
    Download,
    MoreHorizontal,
    TrendingUp,
    Loader2,
    FileX,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { exportToCSV, formatDateForFilename } from "@/utils/csv-export";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { FilterDropdown } from "@/components/mentor/filter-dropdown";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import {
    getMentorBalance,
    getFinanceStats,
    getMentorTransactions
} from "@/services/mentor";

function TransactionStatusBadge({ type }: { type: string }) {
    const isIncome = type.toLowerCase() === "income" || type.toLowerCase() === "commission";

    return (
        <Badge variant="outline" className={isIncome
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"}>
            {type === "income" ? "Pendapatan" : type === "commission" ? "Komisi" : "Penarikan"}
        </Badge>
    );
}

const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default function FinancePage() {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    const { data: balanceRes, isLoading: isLoadingBalance } = useSWR("/v1/mentor/balance", () => getMentorBalance());
    const { data: statsRes, isLoading: isLoadingStats } = useSWR("/v1/mentor/finance/stats", () => getFinanceStats());
    const { data: txRes, isLoading: isLoadingTx } = useSWR(

        [`/v1/mentor/transactions`, page, typeFilter.join(",")],
        () => getMentorTransactions(page, 10, typeFilter.join(","))
    );

    const balance = balanceRes?.data?.balance || "0";
    const stats = statsRes?.data;
    const transactions = txRes?.data || [];
    const meta = txRes?.metadata;

    const handleExportCSV = () => {
        try {
            if (transactions.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            exportToCSV(
                transactions as unknown as Record<string, unknown>[],
                `mentor-transactions-${formatDateForFilename()}`,
                [
                    { key: "description", label: "Deskripsi" },
                    { key: "type", label: "Tipe" },
                    { key: "amount", label: "Jumlah" },
                    { key: "reference_type", label: "Referensi" },
                    { key: "created_at", label: "Tanggal" },
                ] as { key: keyof Record<string, unknown>; label: string }[]
            );
            toast.success("Data transaksi berhasil diekspor!");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Gagal mengekspor data");
        }
    };

    return (
        <>
            {/* Header */}
            <PageHeader breadcrumbs={[{ label: "Saldo & Keuangan" }]} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-violet-600 text-white border-none overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet className="h-24 w-24" />
                            </div>
                            <CardContent className="p-6 relative">
                                <p className="text-violet-100 text-sm font-medium mb-2">Total Saldo Saat Ini</p>
                                {isLoadingBalance ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : (
                                    <h2 className="text-3xl font-bold mb-4">{formatCurrency(balance)}</h2>
                                )}
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <span className="flex items-center bg-white/20 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats?.income_change_pct ? `${stats.income_change_pct > 0 ? '+' : ''}${stats.income_change_pct}%` : "0%"}
                                    </span>
                                    <span className="text-violet-200">Bulan ini</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-violet-600/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="text-xs font-normal">30 Hari Terakhir</Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-1">Total Pendapatan</p>
                                {isLoadingStats ? (
                                    <Skeleton className="h-8 w-32" />
                                ) : (
                                    <h3 className="text-2xl font-bold">{formatCurrency(stats?.total_income_30d || "0")}</h3>
                                )}
                                <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {stats?.income_change_pct || 0}% vs bulan lalu
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-violet-600/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="text-xs font-normal">30 Hari Terakhir</Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-1">Total Komisi</p>
                                {isLoadingStats ? (
                                    <Skeleton className="h-8 w-32" />
                                ) : (
                                    <h3 className="text-2xl font-bold">{formatCurrency(stats?.total_commission_30d || "0")}</h3>
                                )}
                                <p className="text-xs text-blue-600 mt-2 font-medium flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Target: {formatCurrency(stats?.commission_target || "2500000")}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Statistik Pendapatan</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Tren pendapatan 6 bulan terakhir</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="h-8">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            2023
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="h-[300px] w-full mt-4 flex items-end gap-2 px-2">
                                        {/* Chart using real data from stats */}
                                        {isLoadingStats ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            (stats?.chart_data || []).map((item, i) => {
                                                // Find max value for scaling (min 1M to avoid div by zero)
                                                const maxVal = Math.max(1000000, ...(stats?.chart_data || []).map(d => d.amount));
                                                const heightPct = Math.min(100, Math.max(5, (item.amount / maxVal) * 100));

                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                        <div className="w-full bg-violet-100 dark:bg-violet-900/30 rounded-t-lg relative transition-all group-hover:bg-violet-600/20" style={{ height: `${heightPct}%` }}>
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                {formatCurrency(item.amount)}
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 w-full bg-violet-600 rounded-t-lg transition-all" style={{ height: i === (stats?.chart_data?.length || 1) - 1 ? '100%' : '40%' }}></div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground font-medium">
                                                            {item.month}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
                                    <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
                                    <div className="flex gap-2">
                                        <FilterDropdown
                                            title="Tipe"
                                            options={[
                                                { value: "income", label: "Pendapatan" },
                                                { value: "commission", label: "Komisi" },
                                                { value: "withdrawal", label: "Penarikan" },
                                            ]}
                                            selectedValues={typeFilter}
                                            onSelect={setTypeFilter}
                                        />
                                        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={transactions.length === 0}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Unduh CSV
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Transaksi</th>
                                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Tipe</th>
                                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Tanggal</th>
                                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Jumlah</th>
                                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y relative min-h-[200px]">
                                                {isLoadingTx ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                                                <p className="text-muted-foreground">Memuat riwayat transaksi...</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : transactions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <FileX className="h-10 w-10 text-muted-foreground/50" />
                                                                <p className="text-muted-foreground font-medium">Belum ada transaksi</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    transactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium">{tx.description}</div>
                                                                <div className="text-xs text-muted-foreground">Ref: {tx.reference_type}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <TransactionStatusBadge type={tx.type} />
                                                            </td>
                                                            <td className="px-6 py-4 text-muted-foreground text-xs">{tx.created_at}</td>
                                                            <td className={`px-6 py-4 text-right font-bold ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-6 py-4 border-t">
                                        <div className="text-xs text-muted-foreground">
                                            Menampilkan <span className="font-medium text-foreground">{transactions.length > 0 ? (page - 1) * 10 + 1 : 0}</span> sampai <span className="font-medium text-foreground">
                                                {Math.min(page * 10, meta?.total_items || 0)}
                                            </span> dari <span className="font-medium text-foreground">{meta?.total_items || 0}</span> hasil
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1 || isLoadingTx}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="text-xs font-medium">
                                                Halaman {page} dari {meta?.total_pages || 1}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(meta?.total_pages || 1, p + 1))}
                                                disabled={page >= (meta?.total_pages || 1) || isLoadingTx}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Stats */}
                        <div>
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detail Pendapatan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Biaya Kursus</span>
                                            <span className="font-bold">{formatCurrency(parseFloat(stats?.total_income_30d || "0") + parseFloat(stats?.total_commission_30d || "0"))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Komisi Platform</span>
                                            <span className="font-bold text-red-500">-{formatCurrency(stats?.total_commission_30d || "0")}</span>
                                        </div>
                                        <div className="h-px bg-border my-2" />
                                        <div className="flex justify-between items-center text-base font-bold">
                                            <span>Bersih</span>
                                            <span className="text-violet-600">{formatCurrency(stats?.total_income_30d || "0")}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900 text-white">
                                    <CardContent className="p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-violet-400" />
                                            Insight Keuangan
                                        </h4>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                            {stats?.income_change_pct && stats.income_change_pct > 0
                                                ? <>Pendapatan Anda meningkat sebesar <span className="text-white font-medium">{stats.income_change_pct}%</span> dibandingkan bulan lalu.</>
                                                : <>Lihat tren pendapatan Anda dan optimalkan jadwal mengajar Anda untuk hasil maksimal.</>
                                            }
                                        </p>
                                        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white border-none">
                                            Lihat Laporan Detail
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
