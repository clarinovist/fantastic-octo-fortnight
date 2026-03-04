import { useState } from "react"
import { SessionTaskDTO } from "@/utils/types/booking"
import {
    ChevronDown,
    ChevronUp,
    FileText,
    MessageCircle,
    Download,
    Award,
    Star,
    Trophy,
    Medal
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionHistoryAccordionProps {
    tasks?: SessionTaskDTO[]
    progressNotes?: string
}

export function SessionHistoryAccordion({ tasks, progressNotes }: SessionHistoryAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!tasks || tasks.length === 0) {
        return null
    }

    // Calculate total score for the session if graded
    let totalScore = 0
    let gradedCount = 0
    tasks.forEach((task) => {
        if (task.submission && task.submission.score) {
            totalScore += Number(task.submission.score)
            gradedCount++
        }
    })
    const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0
    const isFullyGraded = gradedCount === tasks.length && tasks.length > 0;

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold font-[var(--font-gochi-hand)] tracking-wide">Riwayat Sesi & Tugas</h2>

            <div className="bg-white rounded-2xl border border-primary/20 overflow-hidden shadow-sm transition-all duration-200">
                {/* Header Toggle */}
                <div
                    className={cn(
                        "flex items-center justify-between p-5 cursor-pointer hover:bg-primary/5 transition-colors",
                        isExpanded ? "bg-primary/5 border-b border-primary/10" : ""
                    )}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                            isFullyGraded ? "bg-green-100 text-green-600" : "bg-primary text-primary-foreground"
                        )}>
                            {isFullyGraded ? <Trophy className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-foreground">
                                {isFullyGraded ? "Sesi Selesai!" : "Aktivitas Sesi Ini"}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground">{tasks.length} Modul / Tugas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {gradedCount > 0 ? (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                                <Star className="h-4 w-4 text-primary fill-primary" />
                                <span className="text-primary font-bold text-sm">Skor Rata-rata: {avgScore}</span>
                            </div>
                        ) : (
                            <div className="hidden sm:flex px-3 py-1 bg-amber-100/50 rounded-full border border-amber-200/50">
                                <span className="text-amber-600 font-bold text-sm">Belum Dinilai</span>
                            </div>
                        )}
                        <div className="p-2 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors">
                            {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-slate-500" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-5 sm:p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">

                        {/* Modules / Tasks List */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-1.5 bg-primary rounded-full"></div>
                                <h3 className="font-bold text-lg">Material & Tugas</h3>
                            </div>
                            <div className="grid gap-3">
                                {tasks.map((task, idx) => (
                                    <div key={task.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-200/60 gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <span className="text-base font-bold text-foreground">{task.title}</span>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        {task.attachment_url && (
                                            <a
                                                href={task.attachment_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-lg transition-colors sm:ml-auto shrink-0 shadow-sm"
                                            >
                                                <Download className="h-4 w-4" /> Lihat Lampiran
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission / Badges Section */}
                        <div className="pt-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-1.5 bg-amber-400 rounded-full"></div>
                                <h3 className="font-bold text-lg">Hasil & Penghargaan</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.filter(t => t.submission && t.submission.submission_url).length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                                        <Award className="h-10 w-10 text-slate-300 mb-3" />
                                        <p className="text-sm font-medium text-slate-500 text-center">Tugas belum dinilai atau diunggah oleh mentor.</p>
                                    </div>
                                ) : (
                                    tasks.map((task) => {
                                        if (!task.submission || !task.submission.submission_url) return null;
                                        const score = Number(task.submission.score);
                                        const isPerfect = score === 100;
                                        const isGreat = score >= 85 && score < 100;

                                        return (
                                            <div key={`sub-${task.id}`} className="group relative flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-300">
                                                {/* Image preview */}
                                                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                                        style={{ backgroundImage: `url('${task.submission.submission_url}')` }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
                                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                                        <p className="text-xs font-bold truncate tracking-wide uppercase drop-shadow-md opacity-90">{task.title}</p>
                                                    </div>
                                                </div>

                                                {/* Gamified Badge area */}
                                                <div className="p-4 flex items-center justify-between bg-gradient-to-br from-white to-slate-50">
                                                    <div>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nilai Akhir</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={cn(
                                                                "text-3xl font-black tracking-tighter",
                                                                isPerfect ? "text-amber-500" : isGreat ? "text-slate-600" : "text-primary"
                                                            )}>
                                                                {score}
                                                            </span>
                                                            <span className="text-sm font-bold text-slate-400">/100</span>
                                                        </div>
                                                    </div>

                                                    {/* Badge Icon */}
                                                    <div className={cn(
                                                        "flex items-center justify-center h-14 w-14 rounded-full shadow-inner",
                                                        isPerfect ? "bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300" :
                                                            isGreat ? "bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300" :
                                                                "bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/20"
                                                    )}>
                                                        {isPerfect ? (
                                                            <Trophy className="h-6 w-6 text-amber-500 fill-amber-500/20" />
                                                        ) : isGreat ? (
                                                            <Medal className="h-6 w-6 text-slate-500 fill-slate-500/20" />
                                                        ) : (
                                                            <Award className="h-6 w-6 text-primary" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Mentor Feedback Section */}
                        {progressNotes && (
                            <div className="mt-4 pt-6 border-t border-slate-100">
                                <div className="relative bg-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-sm overflow-hidden">
                                    <MessageCircle className="absolute -right-6 -bottom-6 h-32 w-32 text-primary/5 rotate-12" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <MessageCircle className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-base font-bold text-foreground">Catatan Mentor</h3>
                                        </div>
                                        <p className="text-base italic text-slate-700 leading-relaxed font-medium pl-14 border-l-4 border-primary/20 ml-2">
                                            "{progressNotes}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
