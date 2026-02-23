"use client";

import Link from "next/link";

import useSWR from "swr";
import { getMentorStudents, getInviteCode } from "@/services/mentor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentActions } from "@/components/students/student-actions";
import { toast } from "sonner";
import {
    Search,
    QrCode,
    Copy,
    Share2,
    ChevronLeft,
    ChevronRight,
    Mail,
    Loader2,
    UserX,
} from "lucide-react";
import { FilterDropdown } from "@/components/mentor/filter-dropdown";
import { PageHeader } from "@/components/layout/page-header";
import { useDebounce } from "@/utils/hooks";
import { useRef } from "react";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
    const isAktif = status.toLowerCase() === "active" || status === "Aktif";

    const variant = isAktif
        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";

    const dotColor = isAktif ? "bg-emerald-500" : "bg-slate-400";

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variant}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {status === "active" ? "Aktif" : status}
        </span>
    );
}

export default function StudentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const inviteCardRef = useRef<HTMLDivElement>(null);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    // Simple debounce implementation if hook doesn't exist
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce effect
    useDebounce(() => {
        setDebouncedSearch(search);
        setPage(1); // Reset page on search
    }, 500, [search]);

    const { data: studentsRes, isLoading: isLoadingStudents } = useSWR(
        `/v1/mentor/students?page=${page}&limit=10&q=${debouncedSearch}${statusFilter.length ? `&status=${statusFilter.join(",")}` : ""}`,
        getMentorStudents
    );
    const { data: inviteRes } = useSWR("/v1/mentor/invite-code", getInviteCode);

    const students = studentsRes?.data || [];
    const meta = studentsRes?.metadata;
    const inviteCode = inviteRes?.data?.code || "------";

    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        toast.success("Kode undangan berhasil disalin!");
    };

    const handleShare = async () => {
        const shareText = `Gabung les privat bersama saya! Gunakan kode undangan: ${inviteCode} di aplikasi LesPrivate.`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Kode Undangan LesPrivate",
                    text: shareText,
                });
            } catch (err) {
                // User cancelled share or error
                if ((err as Error).name !== "AbortError") {
                    navigator.clipboard.writeText(shareText);
                    toast.success("Teks undangan disalin ke clipboard!");
                }
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success("Teks undangan disalin ke clipboard!");
        }
    };

    const scrollToInviteCode = () => {
        inviteCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <>
            {/* Header */}
            <PageHeader breadcrumbs={[{ label: "Murid Saya" }]} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Murid Saya</h1>
                            <p className="text-muted-foreground max-w-2xl">
                                Kelola daftar murid aktif, pantau sesi belajar, dan undang murid baru untuk bergabung ke kelas Anda.
                            </p>
                        </div>
                        <Button variant="outline" className="border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white font-semibold" onClick={scrollToInviteCode}>
                            <QrCode className="mr-2 h-5 w-5" />
                            Kode Undangan
                        </Button>
                    </div>

                    {/* Invite Code Card */}
                    <div ref={inviteCardRef} className="relative bg-violet-50 dark:bg-violet-600/10 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-violet-600/10">
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="p-3 bg-white dark:bg-violet-600/20 rounded-xl shadow-sm text-violet-600 hidden md:block">
                                <Mail className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-violet-600 dark:text-white mb-1">Kode Undangan Anda</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">Bagikan kode ini kepada calon murid untuk menghubungkan mereka dengan akun Anda.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-white dark:bg-background p-2 rounded-xl border border-violet-600/10 shadow-sm">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 min-w-[120px] text-center">
                                <span className="font-mono text-2xl font-bold tracking-widest text-violet-600 uppercase">
                                    {inviteCode}
                                </span>
                            </div>
                            <div className="flex w-full sm:w-auto gap-2">
                                <Button size="sm" className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700" onClick={handleCopyCode}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Salin
                                </Button>
                                <Button size="sm" variant="ghost" className="text-violet-600 bg-violet-600/10 hover:bg-violet-600/20" onClick={handleShare}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <Card>
                        {/* Toolbar */}


                        <header className="h-16 bg-background border-b flex items-center justify-between px-8 flex-shrink-0">
                            <div className="flex-1 max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari murid..."
                                    className="pl-10 h-10 border-none bg-slate-100 dark:bg-slate-800 focus-visible:ring-1 focus-visible:ring-violet-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <FilterDropdown
                                    title="Status"
                                    options={[
                                        { value: "active", label: "Aktif" },
                                        { value: "inactive", label: "Tidak Aktif" },
                                    ]}
                                    selectedValues={statusFilter}
                                    onSelect={setStatusFilter}
                                />
                                <Button className="bg-violet-600 hover:bg-violet-700">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Pesan Massal
                                </Button>
                            </div>
                        </header>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-muted-foreground">Murid</th>
                                            <th className="px-6 py-4 font-semibold text-muted-foreground">Tanggal Gabung</th>
                                            <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                                            <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Total Sesi</th>
                                            <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y relative min-h-[200px]">
                                        {isLoadingStudents ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                                        <p className="text-muted-foreground">Memuat data murid...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : students.length === 0 ? (
                                            debouncedSearch ? (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Search className="h-10 w-10 text-muted-foreground/50" />
                                                            <p className="text-muted-foreground font-medium">Pencarian tidak ditemukan</p>
                                                            <p className="text-xs text-muted-foreground">Tidak ada murid yang cocok dengan &quot;{debouncedSearch}&quot;.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <UserX className="h-10 w-10 text-muted-foreground/50" />
                                                            <p className="text-muted-foreground font-medium">Belum ada murid terdaftar</p>
                                                            <p className="text-xs text-muted-foreground">Gunakan kode undangan di atas untuk menambah murid baru.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        ) : (
                                            students.map((s, idx) => (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border">
                                                                <AvatarFallback className="bg-violet-100 text-violet-600 font-bold">
                                                                    {s.name.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <Link href={`/students/${s.student_id}`} className="font-semibold hover:text-violet-600 transition-colors hover:underline">{s.name}</Link>
                                                                <div className="text-xs text-muted-foreground">{s.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">{s.joined_at.split(' ')[0]}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-medium">
                                                            {s.total_sessions}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <StudentActions studentId={s.student_id} studentName={s.name} />
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
                                    Menampilkan <span className="font-medium text-foreground">{students.length > 0 ? (page - 1) * 10 + 1 : 0}</span> sampai <span className="font-medium text-foreground">
                                        {Math.min(page * 10, meta?.total_items || 0)}
                                    </span> dari <span className="font-medium text-foreground">{meta?.total_items || 0}</span> hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || isLoadingStudents}
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
                                        disabled={page >= (meta?.total_pages || 1) || isLoadingStudents}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div >
        </>
    );
}
