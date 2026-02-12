"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { getStudentDetail } from "@/services/mentor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    User,
    AlertCircle,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        accepted: { label: "Diterima", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        pending: { label: "Menunggu", className: "bg-amber-50 text-amber-700 border-amber-200" },
        declined: { label: "Ditolak", className: "bg-red-50 text-red-700 border-red-200" },
        expired: { label: "Kedaluwarsa", className: "bg-slate-50 text-slate-500 border-slate-200" },
    };
    const s = map[status] || { label: status, className: "bg-slate-50 text-slate-600 border-slate-200" };
    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, error, isLoading } = useSWR(
        `/v1/mentor/students/${id}`,
        () => getStudentDetail(id)
    );
    const student = data?.data;

    return (
        <>
            {/* Header */}
            <header className="h-14 bg-background border-b flex items-center px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/students">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-base font-bold">Detail Murid</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                    </div>
                ) : error || !student ? (
                    <div className="max-w-md mx-auto text-center py-20">
                        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Gagal memuat data murid.</p>
                        <Link href="/students">
                            <Button variant="outline" size="sm" className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Profile Card */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold text-lg flex-shrink-0">
                                        {student.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold">{student.name}</h2>
                                        <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5" />
                                                {student.email}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Bergabung {student.joined_at.split(" ")[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={student.status === "active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-slate-50 text-slate-600 border-slate-200"
                                        }
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${student.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                        {student.status === "active" ? "Aktif" : "Tidak Aktif"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: BookOpen, label: "Total Sesi", value: student.total_sessions, color: "text-violet-600", bg: "bg-violet-50" },
                                { icon: CheckCircle2, label: "Dikonfirmasi", value: student.completed_sessions, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { icon: Clock, label: "Menunggu", value: student.upcoming_sessions, color: "text-amber-600", bg: "bg-amber-50" },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                            <stat.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                            <p className="text-lg font-bold">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Session History */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-violet-600" />
                                    Riwayat Sesi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {!student.sessions || student.sessions.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                                        <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        Belum ada riwayat sesi dengan murid ini.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tanggal</th>
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Mata Pelajaran</th>
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tipe</th>
                                                    <th className="px-6 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.sessions.map((session) => (
                                                    <tr key={session.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <div className="font-medium">{session.booking_date}</div>
                                                            <div className="text-xs text-muted-foreground">{session.booking_time}</div>
                                                        </td>
                                                        <td className="px-6 py-3 font-medium">{session.course_name}</td>
                                                        <td className="px-6 py-3">
                                                            <Badge variant="outline" className={session.class_type === "offline"
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : "bg-purple-50 text-purple-700 border-purple-200"
                                                            }>
                                                                {session.class_type === "offline" ? "Tatap Muka" : "Online"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <StatusBadge status={session.status} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
