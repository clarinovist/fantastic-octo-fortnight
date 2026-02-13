"use client";

import { deleteStudentAction, changeRoleStudentAction } from "@/actions/student";
import { ConfirmDialog } from "@/components/base/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Student } from "@/utils/types";
import {
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    SquarePen,
    Trash2,
    User,
    UserCog,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/utils/helpers/formatter";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

type StudentTableProps = {
    students: Student[];
    totalData: number;
    currentPage?: number;
    pageSize?: number;
};

type DeleteConfirmState = {
    isOpen: boolean;
    studentId: string;
    studentName: string;
};

type ChangeRoleConfirmState = {
    isOpen: boolean;
    studentId: string;
    studentName: string;
};

export function StudentTable({
    students,
    totalData,
    currentPage = 1,
    pageSize = 10,
}: StudentTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChangingRole, setIsChangingRole] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        isOpen: false,
        studentId: "",
        studentName: "",
    });

    const [changeRoleConfirm, setChangeRoleConfirm] = useState<ChangeRoleConfirmState>({
        isOpen: false,
        studentId: "",
        studentName: "",
    });

    // Search
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const q = searchParams.get("q") || "";
    const [localSearchTerm, setLocalSearchTerm] = useState(q);

    useEffect(() => {
        setLocalSearchTerm(q);
    }, [q]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setLocalSearchTerm(value);
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                startTransition(() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (value) {
                        params.set("q", value);
                    } else {
                        params.delete("q");
                    }
                    params.set("page", "1");
                    router.push(`?${params.toString()}`);
                });
            }, 500);
        },
        [router, searchParams]
    );

    // Delete
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteStudentAction([deleteConfirm.studentId]);
            if (result.success) {
                toast.success(`Student "${deleteConfirm.studentName}" deleted successfully`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete student");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, studentId: "", studentName: "" });
        }
    };

    // Change Role
    const handleChangeRole = async () => {
        setIsChangingRole(true);
        try {
            const result = await changeRoleStudentAction(changeRoleConfirm.studentId);
            if (result.success) {
                toast.success(`Role changed for "${changeRoleConfirm.studentName}"`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to change role");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsChangingRole(false);
            setChangeRoleConfirm({ isOpen: false, studentId: "", studentName: "" });
        }
    };

    const totalPages = Math.ceil(totalData / pageSize);

    return (
        <>
            {/* Search Toolbar */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
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
                                    Student
                                </th>
                                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Premium
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
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-input text-violet-600 focus:ring-violet-600/20 h-4 w-4 bg-background"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground group-hover:text-violet-600 transition-colors">
                                                        {student.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={student.premiumSubscription || "Inactive"} />
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(student.createdAt)}
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
                                                    <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>
                                                        <User className="mr-2 size-4" /> Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/students/form?id=${student.id}`)}>
                                                        <SquarePen className="mr-2 size-4" /> Edit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-amber-600 focus:text-amber-600"
                                                        onClick={() => setChangeRoleConfirm({ isOpen: true, studentId: student.id, studentName: student.name })}
                                                    >
                                                        <UserCog className="mr-2 size-4" /> Change Role
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => setDeleteConfirm({ isOpen: true, studentId: student.id, studentName: student.name })}
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
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card text-sm text-muted-foreground">
                    <span>
                        Showing page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                        <span className="font-medium text-foreground">{totalPages || 1}</span> ({totalData} total)
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || isPending}
                            onClick={() => {
                                startTransition(() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("page", String(currentPage - 1));
                                    router.push(`?${params.toString()}`);
                                });
                            }}
                        >
                            <ChevronLeft className="size-4 mr-1" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || isPending}
                            onClick={() => {
                                startTransition(() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("page", String(currentPage + 1));
                                    router.push(`?${params.toString()}`);
                                });
                            }}
                        >
                            Next <ChevronRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteConfirm.isOpen}
                onOpenChange={(open) =>
                    setDeleteConfirm({ isOpen: open, studentId: "", studentName: "" })
                }
                title="Delete Student"
                description={`Are you sure you want to delete "${deleteConfirm.studentName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
            />

            {/* Change Role Confirmation */}
            <ConfirmDialog
                open={changeRoleConfirm.isOpen}
                onOpenChange={(open) =>
                    setChangeRoleConfirm({ isOpen: open, studentId: "", studentName: "" })
                }
                title="Change Student Role"
                description={`Are you sure you want to change the role for "${changeRoleConfirm.studentName}"?`}
                confirmLabel="Change Role"
                cancelLabel="Cancel"
                variant="default"
                onConfirm={handleChangeRole}
            />
        </>
    );
}
