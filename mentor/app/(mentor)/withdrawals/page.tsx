"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getMentorBalance, getMentorWithdrawals } from "@/services/mentor";
import { submitWithdrawalAction } from "@/actions/mentor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Wallet,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Download,
    History as HistoryIcon,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowRight,
    Building2,
    FileX,
    Info,
} from "lucide-react";
import { FilterDropdown } from "@/components/mentor/filter-dropdown";
import { PageHeader } from "@/components/layout/page-header";
import { exportToCSV, formatDateForFilename } from "@/utils/csv-export";

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s === "pending") {
        return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1.5 px-2.5 py-1 font-medium">
                <Clock className="h-3 w-3" />
                Menunggu
            </Badge>
        );
    }
    if (s === "approved" || s === "completed") {
        return (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-2.5 py-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Berhasil
            </Badge>
        );
    }
    if (s === "rejected" || s === "failed") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 px-2.5 py-1 font-medium">
                <XCircle className="h-3 w-3" />
                Ditolak
            </Badge>
        );
    }
    return <Badge variant="outline">{status}</Badge>;
}

const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default function WithdrawalsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: balanceRes, isLoading: isLoadingBalance } = useSWR("/v1/mentor/balance", getMentorBalance);
    const { data: withdrawRes, isLoading: isLoadingHistory } = useSWR(
        [`/v1/mentor/withdrawals`, page, statusFilter.join(",")],
        () => getMentorWithdrawals(page, 10, statusFilter.join(","))
    );

    const balance = parseFloat(balanceRes?.data?.balance || "0");
    const history = withdrawRes?.data || [];
    const meta = withdrawRes?.metadata;

    const handleQuickAmount = (val: number) => {
        setAmount(val.toString());
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amountVal = parseFloat(amount);

        if (amountVal > balance) {
            toast.error("Saldo tidak mencukupi");
            return;
        }

        setIsSubmitting(true);
        const result = await submitWithdrawalAction(formData);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Permintaan penarikan berhasil diajukan!");
            setAmount("");
            (e.target as HTMLFormElement).reset();
        } else {
            toast.error(result.error);
        }
    };

    const handleExportCSV = () => {
        try {
            if (history.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            exportToCSV(
                history as unknown as Record<string, unknown>[],
                `mentor-withdrawals-${formatDateForFilename()}`,
                [
                    { key: "amount", label: "Jumlah" },
                    { key: "status", label: "Status" },
                    { key: "bank_name", label: "Bank" },
                    { key: "account_number", label: "No. Rekening" },
                    { key: "account_name", label: "Nama Pemilik" },
                    { key: "created_at", label: "Tanggal" },
                ] as { key: keyof Record<string, unknown>; label: string }[]
            );
            toast.success("Data penarikan berhasil diekspor!");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Gagal mengekspor data");
        }
    };

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Penarikan Dana" }]} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side: Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Balance Summary Card */}
                            <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                    <Wallet className="h-32 w-32" />
                                </div>
                                <CardContent className="p-8 relative">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-violet-100 font-medium">Saldo Tersedia</p>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1">Dana Aman</Badge>
                                    </div>
                                    {isLoadingBalance ? (
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    ) : (
                                        <h2 className="text-4xl font-bold mb-6">{formatCurrency(balance)}</h2>
                                    )}
                                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                        <div className="flex items-center gap-3 text-sm text-violet-100">
                                            <AlertCircle className="h-4 w-4" />
                                            Minimal penarikan adalah Rp 50.000
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Withdrawal Form */}
                            <Card className="border-2 border-slate-100 dark:border-slate-800">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <ArrowRight className="h-5 w-5 text-violet-600" />
                                        Ajukan Penarikan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-muted-foreground block" htmlFor="amount">Jumlah Penarikan (IDR)</label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-violet-600 transition-colors">Rp</span>
                                                <Input
                                                    id="amount"
                                                    name="amount"
                                                    type="number"
                                                    placeholder="0"
                                                    className="pl-12 h-14 text-xl font-bold focus-visible:ring-violet-600 rounded-xl bg-slate-50 dark:bg-slate-800 border-none transition-all"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {/* Quick Amount Pills */}
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {[100000, 200000, 500000, 1000000].map((val) => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => handleQuickAmount(val)}
                                                        className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all dark:bg-slate-800"
                                                    >
                                                        {formatCurrency(val)}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickAmount(balance)}
                                                    className="px-4 py-2 rounded-full border border-violet-600 text-violet-600 text-sm font-bold hover:bg-violet-600 hover:text-white transition-all dark:bg-slate-800"
                                                >
                                                    Tarik Semua
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-muted-foreground block" htmlFor="bank_name">Bank Tujuan</label>
                                                <Input id="bank_name" name="bank_name" placeholder="Contoh: BCA / Mandiri / BNI" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-muted-foreground block" htmlFor="account_name">Nama Pemilik Rekening</label>
                                                <Input id="account_name" name="account_name" placeholder="Sesuai buku tabungan" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground block" htmlFor="account_number">Nomor Rekening</label>
                                            <Input id="account_number" name="account_number" placeholder="Masukkan nomor rekening aktif" required />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-lg font-bold rounded-xl shadow-lg shadow-violet-600/20 disabled:opacity-50"
                                                disabled={isSubmitting || !amount || parseFloat(amount) < 50000 || parseFloat(amount) > balance}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    "Konfirmasi Penarikan"
                                                )}
                                            </Button>
                                            <p className="text-center text-xs text-muted-foreground mt-4">
                                                Penarikan akan diproses dalam 1-3 hari kerja.
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side: Bank Cards & History */}
                        <div className="space-y-8">
                            {/* Virtual Bank Card */}
                            <Card className="bg-slate-900 border-none shadow-xl overflow-hidden group">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-10">
                                        <Building2 className="h-8 w-8 text-slate-600 group-hover:text-violet-400 transition-colors" />
                                        <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-500 italic">BANK</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-xl font-mono text-slate-300 tracking-wider">**** **** **** 7890</div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Account Holder</div>
                                                <div className="text-sm font-medium text-white">Mentor User</div>
                                            </div>
                                            <div className="h-10 w-10 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-xl absolute -bottom-5 -right-5"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-800/50 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-medium font-mono uppercase">Bank Central Asia</span>
                                    <div className="h-2 w-8 bg-slate-700 rounded-full"></div>
                                </div>
                            </Card>

                            {/* History Table */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <HistoryIcon className="h-4 w-4" />
                                        Riwayat Penarikan
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <FilterDropdown
                                            title="Status"
                                            options={[
                                                { value: "pending", label: "Menunggu" },
                                                { value: "completed", label: "Berhasil" },
                                                { value: "rejected", label: "Ditolak" },
                                            ]}
                                            selectedValues={statusFilter}
                                            onSelect={(values: string[]) => {
                                                setStatusFilter(values);
                                                setPage(1);
                                            }}
                                        />
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExportCSV} disabled={history.length === 0}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <div className="space-y-0.5">
                                        {isLoadingHistory ? (
                                            <div className="py-10 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-600" />
                                                <p className="text-xs text-muted-foreground mt-2">Memuat riwayat...</p>
                                            </div>
                                        ) : history.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <FileX className="h-8 w-8 mx-auto text-muted-foreground/30" />
                                                <p className="text-xs text-muted-foreground mt-2 font-medium">Belum ada riwayat penarikan</p>
                                            </div>
                                        ) : (
                                            history.map((w) => (
                                                <div key={w.id} className="group hover:bg-muted/50 px-6 py-4 transition-colors flex flex-col gap-3 border-b last:border-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-base">{formatCurrency(w.amount)}</p>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{w.created_at.split(' ')[0]}</p>
                                                        </div>
                                                        <StatusBadge status={w.status} />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                                                        <Info className="h-3 w-3" />
                                                        Transfer ke {w.bank_name} • {w.account_number}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Pagination */}
                                    {meta && (meta.total_pages ?? 0) > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 border-t">
                                            <div className="text-xs text-muted-foreground">
                                                Hal {page} dari {meta.total_pages}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1 || isLoadingHistory}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => Math.min(meta.total_pages ?? 1, p + 1))}
                                                    disabled={page >= (meta.total_pages ?? 1) || isLoadingHistory}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
