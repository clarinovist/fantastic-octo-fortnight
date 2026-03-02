import { useState } from "react"
import { SessionTaskDTO } from "@/utils/types/booking"
import {
    ChevronDown,
    ChevronUp,
    FileText,
    MessageCircle,
    PlayCircle,
    Download
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

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Riwayat Sesi & Tugas</h2>

            <div className="bg-white rounded-xl border border-primary/20 overflow-hidden shadow-sm">
                {/* Header Toggle */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold">Aktivitas Sesi Ini</p>
                            <p className="text-xs text-muted-foreground">{tasks.length} Modul / Tugas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {gradedCount > 0 ? (
                            <p className="text-primary font-bold">Rata-rata: {avgScore}/100</p>
                        ) : (
                            <p className="text-amber-600 font-bold text-sm">Belum Dinilai</p>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100">
                        {/* Modules / Tasks Section */}
                        <div className="mt-4">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                Material & Tugas
                            </p>
                            <div className="flex flex-col gap-2">
                                {tasks.map((task, idx) => (
                                    <div key={task.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <FileText className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-sm font-bold">{task.title}</span>
                                                {task.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        {task.attachmentUrl && (
                                            <a href={task.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline sm:ml-auto bg-primary/5 px-2 py-1.5 rounded-md">
                                                <Download className="h-3.5 w-3.5" /> Lihat Lampiran
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission Section */}
                        <div className="mt-6">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                Hasil Pengerjaan
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {tasks.filter(t => t.submission && t.submission.submissionUrl).length === 0 ? (
                                    <div className="text-xs text-muted-foreground italic px-2 py-4 border-2 border-dashed w-full text-center rounded-lg">
                                        Tugas belum dikumpulkan / belum diunggah oleh mentor.
                                    </div>
                                ) : (
                                    tasks.map((task) => {
                                        if (!task.submission || !task.submission.submissionUrl) return null
                                        return (
                                            <div key={`sub-${task.id}`} className="relative min-w-[120px] aspect-square rounded-lg bg-cover bg-center border shadow-sm flex-shrink-0 group overflow-hidden"
                                                style={{ backgroundImage: `url('${task.submission.submissionUrl}')` }}>
                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                                                {task.submission.score && (
                                                    <div className={cn(
                                                        "absolute top-1.5 right-1.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                                                        Number(task.submission.score) >= 80 ? "bg-emerald-500" : Number(task.submission.score) >= 60 ? "bg-amber-500" : "bg-red-500"
                                                    )}>
                                                        {task.submission.score}/100
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                                                    <p className="text-white text-[10px] font-medium truncate">{task.title}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Mentor Feedback Section */}
                        {progressNotes && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                    <p className="text-sm font-bold text-primary">Catatan Mentor (Progress)</p>
                                </div>
                                <p className="text-sm italic text-slate-700 leading-relaxed">
                                    "{progressNotes}"
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
