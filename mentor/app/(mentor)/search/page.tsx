"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { getMentorStudents, getMentorTransactions } from "@/services/mentor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    Users,
    CreditCard,
    ArrowRight,
    Loader2,
    Home,
} from "lucide-react";
import { NotificationDropdown } from "@/components/mentor/notification-dropdown";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const { data: studentsRes, isLoading: loadingStudents } = useSWR(
        "/v1/mentor/students",
        getMentorStudents
    );
    const { data: txRes, isLoading: loadingTx } = useSWR(
        "/v1/mentor/transactions",
        getMentorTransactions
    );

    const students = studentsRes?.data || [];
    const transactions = txRes?.data || [];

    // Client-side filtering
    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.email.toLowerCase().includes(query.toLowerCase())
    );

    const filteredTransactions = transactions.filter(
        (t) =>
            t.description.toLowerCase().includes(query.toLowerCase()) ||
            t.amount.toString().includes(query)
    );

    const totalResults = filteredStudents.length + filteredTransactions.length;
    const isLoading = loadingStudents || loadingTx;

    return (
        <>
            <header className="h-16 bg-background border-b flex items-center justify-between px-8 flex-shrink-0">
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                <Home className="h-5 w-5" />
                            </Link>
                        </li>
                        <li><span className="text-muted-foreground">/</span></li>
                        <li><span className="text-sm font-medium">Pencarian</span></li>
                    </ol>
                </nav>
                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                </div>
            </header>

            <div className="px-8 py-4 bg-muted/30 border-b">
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Search className="h-5 w-5 text-violet-600" />
                    Hasil Pencarian: &quot;{query}&quot;
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-4xl mx-auto space-y-8">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">Mencari data...</p>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Tidak Ditemukan</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Kami tidak dapat menemukan hasil untuk &quot;{query}&quot;. Coba kata kunci
                                lain atau periksa ejaan Anda.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Students Results */}
                            {filteredStudents.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-violet-600" />
                                            Murid ({filteredStudents.length})
                                        </h2>
                                        <Link href="/students">
                                            <Button variant="link" className="text-violet-600">
                                                Lihat Semua Murid <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredStudents.map((student) => (
                                            <Link
                                                key={student.student_id}
                                                href={`/students/${student.student_id}`}
                                            >
                                                <Card className="hover:border-violet-600 transition-colors cursor-pointer h-full">
                                                    <CardContent className="p-4 flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border">
                                                            <AvatarFallback className="bg-violet-100 text-violet-600 font-bold">
                                                                {student.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold">{student.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {student.email}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Transactions Results */}
                            {filteredTransactions.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-violet-600" />
                                            Transaksi ({filteredTransactions.length})
                                        </h2>
                                        <Link href="/finance">
                                            <Button variant="link" className="text-violet-600">
                                                Lihat Keuangan <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <Card>
                                        <CardContent className="p-0">
                                            <div className="divide-y">
                                                {filteredTransactions.map((tx) => (
                                                    <div
                                                        key={tx.id}
                                                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`p-2 rounded-full ${tx.type === "withdrawal"
                                                                    ? "bg-red-100 text-red-600"
                                                                    : "bg-emerald-100 text-emerald-600"
                                                                    }`}
                                                            >
                                                                {tx.type === "withdrawal" ? (
                                                                    <ArrowRight className="h-4 w-4 -rotate-45" />
                                                                ) : (
                                                                    <ArrowRight className="h-4 w-4 rotate-135" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{tx.description}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {tx.created_at} • {tx.type}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`font-bold ${tx.type === "withdrawal"
                                                                ? "text-red-500"
                                                                : "text-emerald-500"
                                                                }`}
                                                        >
                                                            {tx.type === "withdrawal" ? "-" : "+"}
                                                            {new Intl.NumberFormat("id-ID", {
                                                                style: "currency",
                                                                currency: "IDR",
                                                                minimumFractionDigits: 0,
                                                            }).format(parseFloat(tx.amount))}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
