"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getSessionDetail, createSessionTask, gradeSessionTask, SessionTask } from "@/services/mentor";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Image as ImageIcon,
    Loader2,
    Plus,
} from "lucide-react";

export default function SessionGradingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data, error, isLoading, mutate } = useSWR(
        `/v1/mentor/bookings/${id}`,
        () => getSessionDetail(id)
    );

    const session = data?.data;
    const tasks = session?.session_tasks || [];

    // Form state for new task
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle) return toast.error("Judul tugas wajib diisi");

        setIsSubmitting(true);
        try {
            await createSessionTask(id, {
                title: taskTitle,
                description: taskDesc,
                attachment_url: "https://example.com/dummy-attachment.pdf", // Mocked for now
            });
            toast.success("Tugas berhasil ditambahkan");
            setTaskTitle("");
            setTaskDesc("");
            mutate();
        } catch (err: any) {
            toast.error(err?.message || "Gagal menambahkan tugas");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">Gagal memuat sesi atau sesi tidak ditemukan.</p>
                <Button onClick={() => router.push("/sessions")} variant="outline">
                    Kembali
                </Button>
            </div>
        );
    }

    const breadcrumbs = [
        { label: "Sesi Mengajar", href: "/sessions" },
        { label: `Detail Tugas: ${session.student_name}` }
    ];

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <PageHeader breadcrumbs={breadcrumbs} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

                {/* Session Header Card */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 md:p-6 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                            {session.student_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold">{session.student_name}</h2>
                            <p className="text-sm font-medium text-primary mt-1">
                                {session.course_name} • {session.booking_date}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</p>
                            <p className={`text-sm font-bold ${session.status === 'completed' ? 'text-green-600' : 'text-primary'}`}>
                                {session.status.toUpperCase()}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Tasks */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* New Task Form */}
                        <Card className="border shadow-sm bg-card">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <Plus className="h-5 w-5" />
                                    <h2 className="text-lg font-bold">Buat Tugas Baru</h2>
                                </div>
                                <form onSubmit={handleCreateTask} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground">Judul Tugas</label>
                                        <Input
                                            placeholder="Contoh: Latihan Soal Matematika Bab 1"
                                            value={taskTitle}
                                            onChange={(e) => setTaskTitle(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground">Deskripsi (Opsional)</label>
                                        <Textarea
                                            placeholder="Jelaskan instruksi tugas ini..."
                                            rows={2}
                                            value={taskDesc}
                                            onChange={(e) => setTaskDesc(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting || !taskTitle}>
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Tambah Tugas
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Existing Tasks List */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1 mb-4">
                                Tugas Sesi Ini ({tasks.length})
                            </h2>
                            <div className="space-y-4">
                                {tasks.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                                        Belum ada tugas yang diberikan.
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <TaskCard key={task.id} task={task} onUpdated={mutate} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mentor Notes / Session Completion */}
                    <div className="space-y-6">
                        <Card className="border shadow-sm sticky top-6">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <FileText className="h-5 w-5" />
                                    <h2 className="text-lg font-bold">Catatan Progress Siswa</h2>
                                </div>
                                <Textarea
                                    className="mb-4"
                                    placeholder="Tulis ringkasan penilaian dan perkembangan siswa untuk sesi ini (akan dibaca oleh orang tua)..."
                                    rows={6}
                                />
                                <Button className="w-full shadow-md" size="lg">
                                    Simpan & Notifikasi Orang Tua
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-3">
                                    Laporan PDF akan digenerate setelah ini disave.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for individual Task item
function TaskCard({ task, onUpdated }: { task: SessionTask, onUpdated: () => void }) {
    const isGraded = !!task.submission?.id;
    const [score, setScore] = useState<string>(task.submission?.score ? task.submission.score.toString() : "");
    const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

    const handleSaveGrade = async () => {
        if (!score || isNaN(Number(score))) return toast.error("Nilai tidak valid");
        setIsSubmittingGrade(true);
        try {
            await gradeSessionTask(task.id, {
                submission_url: "https://example.com/student-work-photo.jpg", // Mock upload
                score: Number(score),
            });
            toast.success("Nilai berhasil disimpan");
            onUpdated();
        } catch (err: any) {
            toast.error(err?.message || "Gagal menyimpan nilai");
        } finally {
            setIsSubmittingGrade(false);
        }
    };

    return (
        <Card className={`overflow-hidden transition-all ${isGraded ? 'opacity-80 border-green-200' : 'border-border shadow-sm'}`}>
            <div className="p-5 border-b">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold flex items-center gap-2">
                        {task.title}
                        {isGraded && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </h3>
                    <div className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${isGraded ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isGraded ? 'Dinilai' : 'Pending'}
                    </div>
                </div>
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                )}
                {task.attachment_url && (
                    <div className="flex mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-md text-[11px] font-medium text-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            Lampiran Tugas
                        </div>
                    </div>
                )}
            </div>

            {/* Grading Section */}
            <div className="p-5 bg-muted/20">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Penilaian & Bukti Kerja
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {isGraded && task.submission?.submission_url ? (
                        <div className="relative w-full sm:w-32 aspect-square rounded-lg overflow-hidden border">
                            <img src={task.submission.submission_url} alt="Work" className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-full sm:w-32 aspect-square bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed hover:border-primary cursor-pointer transition-colors group">
                            <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2" />
                            <span className="text-[10px] font-medium text-muted-foreground">Upload Foto</span>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col justify-end">
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Total Nilai</label>
                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                type="number"
                                className="w-20 font-bold text-center text-primary"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                disabled={isSubmittingGrade}
                                placeholder="0"
                            />
                            <span className="text-muted-foreground font-medium">/ 100</span>
                        </div>

                        <Button
                            onClick={handleSaveGrade}
                            disabled={isSubmittingGrade || !score}
                            size="sm"
                            className="w-full sm:w-auto self-start"
                        >
                            {isSubmittingGrade ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isGraded ? "Perbarui Nilai" : "Simpan Nilai"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
