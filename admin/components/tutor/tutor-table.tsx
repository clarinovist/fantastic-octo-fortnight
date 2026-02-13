"use client";

import { deleteTutorAction, changeTutorStatusAction } from "@/actions/tutor";
import { ConfirmDialog } from "@/components/base/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tutor } from "@/utils/types";
import {
    MoreVertical,
    Search,
    CheckCircle,
    XCircle,
    SquarePen,
    Trash2,
    User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import { formatDate } from "@/utils/helpers/formatter";

type TutorTableProps = {
    tutors: Tutor[];
    totalData: number;
    currentPage?: number;
    pageSize?: number;
};

export function TutorTable({
    tutors,
    totalData,
    currentPage = 1,
    pageSize = 10,
}: TutorTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isActionPending, setIsActionPending] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        tutorId: string;
        tutorName: string;
    }>({
        isOpen: false,
        tutorId: "",
        tutorName: "",
    });

    const [statusConfirm, setStatusConfirm] = useState<{
        isOpen: boolean;
        tutorId: string;
        tutorName: string;
        newStatus: "active" | "inactive";
    }>({
        isOpen: false,
        tutorId: "",
        tutorName: "",
        newStatus: "active",
    });

    const q = searchParams.get("q") || "";
    const [localSearchTerm, setLocalSearchTerm] = useState(q);

    useEffect(() => {
        setLocalSearchTerm(q);
    }, [q]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value);

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set("q", value);
            else params.delete("q");
            params.set("page", "1");
            router.push(`?${params.toString()}`);
        }, 500);
    };

    const handleStatusChange = async () => {
        setIsActionPending(true);
        try {
            const result = await changeTutorStatusAction(statusConfirm.tutorId, statusConfirm.newStatus);
            if (result.success) {
                toast.success(`Tutor ${statusConfirm.newStatus === 'active' ? 'verified' : 'deactivated'} successfully`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsActionPending(false);
            setStatusConfirm({ ...statusConfirm, isOpen: false });
        }
    };

    const handleDelete = async () => {
        setIsActionPending(true);
        try {
            const result = await deleteTutorAction([deleteConfirm.tutorId]);
            if (result.success) {
                toast.success("Tutor deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete tutor");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsActionPending(false);
            setDeleteConfirm({ ...deleteConfirm, isOpen: false });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Filters & Controls */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                    <input
                        type="text"
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search tutors..."
                        className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="p-4 pl-6 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-input text-violet-600 focus:ring-violet-600/20 h-4 w-4 bg-background"
                                    />
                                </th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Tutor
                                </th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Joined Date
                                </th>
                                <th className="p-4 pr-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tutors.length > 0 ? (
                                tutors.map((tutor) => (
                                    <tr key={tutor.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-input text-violet-600 focus:ring-violet-600/20 h-4 w-4 bg-background"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                                                    {tutor.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground group-hover:text-violet-600 transition-colors">
                                                        {tutor.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {tutor.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tutor.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700/50'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${tutor.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {tutor.status === 'active' ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(tutor.createdAt)}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-muted-foreground hover:text-violet-600 p-2 rounded-lg hover:bg-violet-600/5 transition-colors">
                                                        <MoreVertical className="size-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.push(`/tutors/${tutor.id}`)}>
                                                        <User className="mr-2 size-4" /> Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/tutors/form?id=${tutor.id}`)}>
                                                        <SquarePen className="mr-2 size-4" /> Edit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    {tutor.status !== 'active' ? (
                                                        <DropdownMenuItem
                                                            className="text-emerald-600 focus:text-emerald-600"
                                                            onClick={() => setStatusConfirm({ isOpen: true, tutorId: tutor.id, tutorName: tutor.name, newStatus: "active" })}
                                                        >
                                                            <CheckCircle className="mr-2 size-4" /> Verify Tutor
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-amber-600 focus:text-amber-600"
                                                            onClick={() => setStatusConfirm({ isOpen: true, tutorId: tutor.id, tutorName: tutor.name, newStatus: "inactive" })}
                                                        >
                                                            <XCircle className="mr-2 size-4" /> Deactivate
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => setDeleteConfirm({ isOpen: true, tutorId: tutor.id, tutorName: tutor.name })}
                                                    >
                                                        <Trash2 className="mr-2 size-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No tutors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card text-sm text-muted-foreground">
                    <span>
                        Showing page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{Math.ceil(totalData / pageSize)}</span> ({totalData} total)
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || isActionPending}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", (currentPage - 1).toString());
                                router.push(`?${params.toString()}`);
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage * pageSize >= totalData || isActionPending}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", (currentPage + 1).toString());
                                router.push(`?${params.toString()}`);
                            }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                open={statusConfirm.isOpen}
                onOpenChange={(open) => setStatusConfirm({ ...statusConfirm, isOpen: open })}
                title={statusConfirm.newStatus === 'active' ? "Verify Tutor" : "Deactivate Tutor"}
                description={`Are you sure you want to ${statusConfirm.newStatus === 'active' ? 'verify' : 'deactivate'} ${statusConfirm.tutorName}?`}
                confirmLabel={statusConfirm.newStatus === 'active' ? "Verify" : "Deactivate"}
                onConfirm={handleStatusChange}
            />

            <ConfirmDialog
                open={deleteConfirm.isOpen}
                onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, isOpen: open })}
                title="Delete Tutor"
                description={`Are you sure you want to delete ${deleteConfirm.tutorName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}
