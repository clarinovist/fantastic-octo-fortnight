"use client";

import { useState } from "react";
import useSWR from "swr";
import { getSessionDetail, updateSessionStatus } from "@/services/mentor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    User,
    FileText,
    XCircle,
    Loader2,
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

interface SessionDetailDialogProps {
    sessionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChanged?: () => void;
}

export function SessionDetailDialog({ sessionId, open, onOpenChange, onStatusChanged }: SessionDetailDialogProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const { data, isLoading } = useSWR(
        sessionId && open ? `/v1/mentor/sessions/${sessionId}` : null,
        () => (sessionId ? getSessionDetail(sessionId) : null)
    );
    const session = data?.data;

    const handleCancel = async () => {
        if (!sessionId) return;
        setIsCancelling(true);
        try {
            await updateSessionStatus(sessionId, "declined");
            toast.success("Sesi berhasil dibatalkan");
            onStatusChanged?.();
            onOpenChange(false);
        } catch {
            toast.error("Gagal membatalkan sesi");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Detail Sesi</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    </div>
                ) : !session ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Gagal memuat data sesi.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Status Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <StatusBadge status={session.status} />
                        </div>

                        {/* Info Grid */}
                        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                            <InfoRow icon={User} label="Murid" value={session.student_name} />
                            <InfoRow icon={BookOpen} label="Mata Pelajaran" value={session.course_name} />
                            <InfoRow icon={Calendar} label="Tanggal" value={session.booking_date} />
                            <InfoRow icon={Clock} label="Waktu" value={session.booking_time} />
                            <InfoRow icon={MapPin} label="Tipe" value={session.class_type === "offline" ? "Tatap Muka" : "Online"} />
                            {session.code && (
                                <InfoRow icon={FileText} label="Kode" value={session.code} />
                            )}
                            {session.notes && (
                                <InfoRow icon={FileText} label="Catatan" value={session.notes} />
                            )}
                        </div>

                        {/* Action Buttons */}
                        {(session.status === "accepted" || session.status === "pending") && (
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    disabled={isCancelling}
                                    onClick={handleCancel}
                                >
                                    {isCancelling ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Batalkan Sesi
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground w-28 flex-shrink-0">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
