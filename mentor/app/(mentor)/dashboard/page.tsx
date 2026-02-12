"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { getMentorBalance, getMentorStudents, getMentorTransactions, getMentorWithdrawals } from "@/services/mentor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentActions } from "@/components/students/student-actions";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import {
    Users,
    Wallet,
    TrendingUp,
    Clock,
    ChevronRight,
    BookOpen,
    Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TutorLevelCard } from "@/components/dashboard/tutor-level-card";

const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default function Dashboard() {
    const { data: balanceRes, isLoading: isLoadingBalance } = useSWR("/v1/mentor/balance", getMentorBalance);
    const { data: studentsRes, isLoading: isLoadingStudents } = useSWR("/v1/mentor/students", getMentorStudents);
    const { data: txRes } = useSWR("/v1/mentor/transactions", getMentorTransactions);
    const { data: withdrawRes } = useSWR("/v1/mentor/withdrawals", getMentorWithdrawals);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const balance = balanceRes?.data?.balance || "0";
    const students = studentsRes?.data || [];
    const transactions = txRes?.data || [];
    const withdrawals = withdrawRes?.data || [];

    const pendingWithdrawals = withdrawals.filter(w => w.status.toLowerCase() === 'pending');
    const totalPendingWithdrawalAmount = pendingWithdrawals.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    // Calculate monthly income from credit transactions this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = transactions
        .filter(t => {
            const d = new Date(t.created_at);
            return t.type === "credit" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const monthlyTxCount = transactions.filter(t => {
        const d = new Date(t.created_at);
        return t.type === "credit" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Count students who joined this month
    const newStudentsThisMonth = students.filter(s => {
        const d = new Date(s.joined_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const stats = [
        {
            title: "Total Murid",
            value: students.length.toString(),
            icon: Users,
            trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} baru` : "Bulan ini",
            trendColor: newStudentsThisMonth > 0 ? "text-emerald-500" : "text-slate-400",
            bgColor: "bg-blue-500/10",
            iconColor: "text-blue-500",
        },
        {
            title: "Saldo Tersedia",
            value: formatCurrency(balance),
            icon: Wallet,
            trend: "Siap ditarik",
            trendColor: "text-slate-400",
            bgColor: "bg-violet-500/10",
            iconColor: "text-violet-500",
        },
        {
            title: "Pendapatan Bulan Ini",
            value: formatCurrency(monthlyIncome),
            icon: TrendingUp,
            trend: monthlyTxCount > 0 ? `${monthlyTxCount} transaksi` : "Belum ada",
            trendColor: monthlyTxCount > 0 ? "text-emerald-500" : "text-slate-400",
            bgColor: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
        },
        {
            title: "Penarikan Pending",
            value: formatCurrency(totalPendingWithdrawalAmount),
            icon: Clock,
            trend: `${pendingWithdrawals.length} permintaan`,
            trendColor: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            iconColor: "text-yellow-500",
        },
    ];

    return (
        <>
            <CreateSessionDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    // Optionally refresh data here if needed
                }}
            />

            {/* Header */}
            <PageHeader breadcrumbs={[{ label: "Dashboard Mentor" }]} />

            {/* Main Content */}
            < div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50" >
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Selamat Datang 👋</h2>
                            <p className="text-muted-foreground mt-1 text-lg">
                                Lihat ringkasan performa dan aktivitas mengajar Anda hari ini.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Mulai Sesi Baru
                            </Button>
                        </div>
                    </div>

                    {/* Main Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden h-full">
                                <CardContent className="p-5 relative flex flex-col justify-between h-full">
                                    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity blur-3xl`} />
                                    <div className="flex items-center justify-between mb-3 relative">
                                        <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.iconColor}`}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${stat.trendColor} flex items-center`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{stat.title}</p>
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            {isLoadingBalance && stat.title.includes("Saldo") ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                                            ) : (
                                                stat.value
                                            )}
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Tutor Level */}
                    <TutorLevelCard />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Transactions */}
                        <Card className="lg:col-span-2 border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
                                <CardTitle className="text-base font-bold">Transaksi Terakhir</CardTitle>
                                <Link href="/finance">
                                    <Button variant="ghost" size="sm" className="text-violet-600 font-semibold hover:bg-violet-50">
                                        Lihat Semua
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactions.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                                        Belum ada transaksi terbaru.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Deskripsi</th>
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 5).map((tx) => (
                                                    <tr key={tx.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <div className="font-semibold text-sm">{tx.description}</div>
                                                            <div className="text-xs text-muted-foreground">{tx.created_at}</div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <Badge variant="outline" className={tx.type === 'withdrawal' ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}>
                                                                {tx.type === 'income' ? 'Pendapatan' : tx.type === 'commission' ? 'Komisi' : 'Penarikan'}
                                                            </Badge>
                                                        </td>
                                                        <td className={`px-6 py-3 text-right font-bold ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Students */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="text-base font-bold">Murid Baru</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingStudents ? (
                                    <div className="flex justify-center items-center py-16">
                                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                                        Belum ada murid baru.
                                    </div>
                                ) : (
                                    <div>
                                        {students.slice(0, 5).map((s, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 px-6 border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                                                        {s.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold group-hover:text-violet-600 transition-colors">{s.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.joined_at.split(' ')[0]}</p>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <StudentActions studentId={s.student_id} studentName={s.name} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {students.length > 5 && (
                                    <Link href="/students" className="block">
                                        <Button variant="ghost" className="w-full text-xs font-bold text-violet-600 py-3 border-t h-auto hover:bg-violet-50 rounded-none">
                                            Lihat Semua Murid
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div >
        </>
    );
}
