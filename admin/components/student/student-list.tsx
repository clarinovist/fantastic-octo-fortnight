"use client";

import {
  changeRoleStudentAction,
  deleteStudentAction,
} from "@/actions/student";
import { ConfirmDialog } from "@/components/base/confirm-dialog";
import type {
  BulkAction,
  Column,
  RowAction,
  ToolbarAction,
} from "@/components/base/table/data-table";
import {
  DataTable,
  type DataTableRef,
} from "@/components/base/table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Student } from "@/utils/types";
import {
  ArrowDownAZ,
  ArrowDownZA,
  Calendar,
  ChevronDown,
  Mail,
  MessageSquare,
  Plus,
  SortAsc,
  SquarePen,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { StudentMessageDialog } from "./student-message-dialog";

type StudentListProps = {
  students: Student[];
  totalData: number;
  currentPage?: number;
  pageSize?: number;
};

type DeleteConfirmState = {
  isOpen: boolean;
  studentIds: string[];
  count: number;
};

type MessageDialogState = {
  isOpen: boolean;
  recipients: Student[];
};

type ChangeRoleConfirmState = {
  isOpen: boolean;
  studentId: string;
  studentName: string;
};

const SORT_OPTIONS = [
  { label: "By Date Join", value: "created_at", icon: Calendar },
  { label: "By Nama", value: "name", icon: User },
  { label: "By Email", value: "email", icon: Mail },
];

const SORT_OPTIONS_DIRECTION = [
  { label: "A - Z", value: "ASC", icon: ArrowDownAZ },
  { label: "Z - A", value: "DESC", icon: ArrowDownZA },
];

export function StudentList({
  students,
  totalData,
  currentPage = 1,
  pageSize = 10,
}: StudentListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTableRef = useRef<DataTableRef>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    studentIds: [],
    count: 0,
  });
  const [messageDialog, setMessageDialog] = useState<MessageDialogState>({
    isOpen: false,
    recipients: [],
  });
  const [changeRoleConfirm, setChangeRoleConfirm] =
    useState<ChangeRoleConfirmState>({
      isOpen: false,
      studentId: "",
      studentName: "",
    });

  // Get current sort state from URL
  const currentSortBy = searchParams.get("sort") || "";
  const currentSortOrder = searchParams.get("sortDirection") || "";

  const handleDeleteStudent = (studentId: string): void => {
    setDeleteConfirm({
      isOpen: true,
      studentIds: [studentId],
      count: 1,
    });
  };

  const handleBulkDeleteRequest = (rows: Student[]): void => {
    const ids = rows.map((row) => row.id);
    setDeleteConfirm({
      isOpen: true,
      studentIds: ids,
      count: ids.length,
    });
  };

  const handleSendMessage = (rows: Student[]): void => {
    setMessageDialog({
      isOpen: true,
      recipients: rows,
    });
  };

  const handleMessageDialogClose = (open: boolean): void => {
    setMessageDialog({
      isOpen: open,
      recipients: open ? messageDialog.recipients : [],
    });
  };

  const executeDelete = async (): Promise<void> => {
    const { studentIds, count } = deleteConfirm;

    setIsDeleting(true);
    try {
      const result = await deleteStudentAction(studentIds);

      if (result.success) {
        toast.success(
          count === 1
            ? "Student deleted successfully"
            : `${count} student(s) deleted successfully`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete student(s)");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, studentIds: [], count: 0 });
    }
  };

  const handleChangeRoleRequest = (student: Student): void => {
    setChangeRoleConfirm({
      isOpen: true,
      studentId: student.id,
      studentName: student.name,
    });
  };

  const executeChangeRole = async (): Promise<void> => {
    const { studentId, studentName } = changeRoleConfirm;

    setIsChangingRole(true);
    try {
      const result = await changeRoleStudentAction(studentId);

      if (result.success) {
        toast.success(`Role changed successfully for ${studentName}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to change student role");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Change role error:", error);
    } finally {
      setIsChangingRole(false);
      setChangeRoleConfirm({ isOpen: false, studentId: "", studentName: "" });
    }
  };

  const handleSort = (sortBy: string): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // If clicking the same sort option, clear it (uncheck)
      if (currentSortBy === sortBy) {
        params.delete("sort");
      } else {
        params.set("sort", sortBy);
      }

      params.set("page", "1");
      router.push(`?${params.toString()}`);
    });
  };

  const handleSortDirection = (sortDirection: string): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // If clicking the same sort direction, clear sorting entirely (uncheck)
      if (currentSortOrder === sortDirection) {
        params.delete("sortDirection");
      } else {
        params.set("sortDirection", sortDirection);
      }

      params.set("page", "1");
      router.push(`?${params.toString()}`);
    });
  };

  const columns: Column<Student>[] = [
    { key: "createdAt", label: "Date Join", width: "200px", type: "datetime" },
    { key: "name", label: "Nama Student", width: "150px" },
    { key: "email", label: "Email", width: "180px" },
    { key: "phoneNumber", label: "Nomor HP/WA", width: "150px" },
    {
      key: "premiumSubscription",
      label: "Status Premium",
      width: "300px",
      render: (value) => {
        const status = String(value ?? "");
        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const rowActions: RowAction<Student>[] = [
    {
      label: "Details",
      variant: "outline",
      href: (row) => `/students/${row.id}`,
    },
    {
      label: "Change Role",
      variant: "outline",
      onClick: (row) => handleChangeRoleRequest(row),
    },
    {
      label: "",
      icon: <SquarePen className="w-4 h-4" />,
      variant: "ghost",
      onClick: (row) => router.push(`/students/form?id=${row.id}`),
    },
    {
      label: "",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "ghost",
      onClick: (row) => handleDeleteStudent(row.id),
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      render: () => (
        <Link href="/students/form">
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={isPending || isDeleting}
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </Link>
      ),
    },
    {
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isPending || isDeleting}
            >
              <SortAsc className="w-4 h-4" />
              Sort By
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS_DIRECTION.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortDirection(option.value)}
                className="gap-2"
              >
                <Checkbox
                  checked={currentSortOrder === option.value}
                  className="pointer-events-none"
                />
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value)}
                className="gap-2"
              >
                <Checkbox
                  checked={currentSortBy === option.value}
                  className="pointer-events-none"
                />
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const bulkActions: BulkAction<Student>[] = [
    {
      label: "Send message",
      icon: <MessageSquare className="w-4 h-4" />,
      variant: "outline",
      onClick: (rows) => handleSendMessage(rows),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "outline",
      onClick: (rows) => handleBulkDeleteRequest(rows),
    },
  ];

  const urlSearchTerm = useMemo(
    () => searchParams.get("q") || "",
    [searchParams]
  );

  const [localSearchTerm, setLocalSearchTerm] = useState<string>(urlSearchTerm);

  useEffect(() => {
    setLocalSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handlePageChange = (page: number): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", newPageSize.toString());
      params.set("page", "1");
      router.push(`${window.location.pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = useCallback(
    (value: string): void => {
      setLocalSearchTerm(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

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

  return (
    <>
      <DataTable<Student>
        ref={dataTableRef}
        data={students}
        columns={columns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search students..."
        emptyMessage="No students found"
        serverSidePagination={true}
        currentPage={currentPage}
        totalItems={totalData}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        searchTerm={localSearchTerm}
        onSearchChange={handleSearchChange}
        isLoading={isPending || isDeleting || isChangingRole}
      />

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirm({ isOpen: open, studentIds: [], count: 0 })
        }
        title={
          deleteConfirm.count === 1
            ? "Delete Student"
            : `Delete ${deleteConfirm.count} Students`
        }
        description={
          deleteConfirm.count === 1
            ? "Are you sure you want to delete this student? This action cannot be undone."
            : `Are you sure you want to delete ${deleteConfirm.count} students? This action cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={executeDelete}
      />

      <ConfirmDialog
        open={changeRoleConfirm.isOpen}
        onOpenChange={(open) =>
          setChangeRoleConfirm({ isOpen: open, studentId: "", studentName: "" })
        }
        title="Change Student Role"
        description={`Are you sure you want to change the role for ${changeRoleConfirm.studentName}?`}
        confirmLabel="Change Role"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={executeChangeRole}
      />

      <StudentMessageDialog
        open={messageDialog.isOpen}
        onOpenChange={handleMessageDialogClose}
        recipients={messageDialog.recipients}
        onMessageSent={() => {
          // Clear selection after message is sent
          dataTableRef.current?.clearSelection();
        }}
      />
    </>
  );
}
