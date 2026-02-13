"use client";

import { changeRoleTutorAction, changeTutorStatusAction, deleteTutorAction } from "@/actions/tutor";
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
import type { Tutor } from "@/utils/types";
import {
  ArrowDownAZ,
  ArrowDownZA,
  Calendar,
  ChevronDown,
  Mail,
  MessageSquare,
  Plus,
  ShieldCheck,
  ShieldX,
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
import { TutorMessageDialog } from "./tutor-message-dialog";

type TutorListProps = {
  tutors: Tutor[];
  totalData: number;
  currentPage?: number;
  pageSize?: number;
};

type DeleteConfirmState = {
  isOpen: boolean;
  tutorIds: string[];
  count: number;
};

type MessageDialogState = {
  isOpen: boolean;
  recipients: Tutor[];
};

type ChangeRoleConfirmState = {
  isOpen: boolean;
  tutorId: string;
  tutorName: string;
};

type StatusConfirmState = {
  isOpen: boolean;
  tutorId: string;
  tutorName: string;
  newStatus: "active" | "inactive";
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

export function TutorList({
  tutors,
  totalData,
  currentPage = 1,
  pageSize = 10,
}: TutorListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTableRef = useRef<DataTableRef>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    tutorIds: [],
    count: 0,
  });
  const [messageDialog, setMessageDialog] = useState<MessageDialogState>({
    isOpen: false,
    recipients: [],
  });
  const [changeRoleConfirm, setChangeRoleConfirm] =
    useState<ChangeRoleConfirmState>({
      isOpen: false,
      tutorId: "",
      tutorName: "",
    });
  const [statusConfirm, setStatusConfirm] = useState<StatusConfirmState>({
    isOpen: false,
    tutorId: "",
    tutorName: "",
    newStatus: "active",
  });

  // Get current sort state from URL
  const currentSortBy = searchParams.get("sort") || "";
  const currentSortOrder = searchParams.get("sortDirection") || "";

  const handleDeleteTutor = (tutorId: string): void => {
    setDeleteConfirm({
      isOpen: true,
      tutorIds: [tutorId],
      count: 1,
    });
  };

  const handleBulkDeleteRequest = (rows: Tutor[]): void => {
    const ids = rows.map((row) => row.id);
    setDeleteConfirm({
      isOpen: true,
      tutorIds: ids,
      count: ids.length,
    });
  };

  const handleSendMessage = (rows: Tutor[]): void => {
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
    const { tutorIds, count } = deleteConfirm;

    setIsDeleting(true);
    try {
      const result = await deleteTutorAction(tutorIds);
      if (result.success) {
        toast.success(
          count === 1
            ? "Tutor deleted successfully"
            : `${count} tutor(s) deleted successfully`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete tutor(s)");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, tutorIds: [], count: 0 });
    }
  };

  const handleChangeRoleRequest = (tutor: Tutor): void => {
    setChangeRoleConfirm({
      isOpen: true,
      tutorId: tutor.id,
      tutorName: tutor.name,
    });
  };

  const executeChangeRole = async (): Promise<void> => {
    const { tutorId, tutorName } = changeRoleConfirm;

    setIsChangingRole(true);
    try {
      const result = await changeRoleTutorAction(tutorId);
      if (result.success) {
        toast.success(`Role changed successfully for ${tutorName}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to change tutor role");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Change role error:", error);
    } finally {
      setIsChangingRole(false);
      setChangeRoleConfirm({ isOpen: false, tutorId: "", tutorName: "" });
    }
  };

  const handleStatusChange = (tutor: Tutor): void => {
    const newStatus = tutor.status === "active" ? "inactive" : "active";
    setStatusConfirm({
      isOpen: true,
      tutorId: tutor.id,
      tutorName: tutor.name,
      newStatus,
    });
  };

  const executeStatusChange = async (): Promise<void> => {
    const { tutorId, tutorName, newStatus } = statusConfirm;

    setIsChangingStatus(true);
    try {
      const result = await changeTutorStatusAction(tutorId, newStatus);
      if (result.success) {
        toast.success(
          newStatus === "active"
            ? `${tutorName} has been verified (active)`
            : `${tutorName} has been deactivated`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to change tutor status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Status change error:", error);
    } finally {
      setIsChangingStatus(false);
      setStatusConfirm({ isOpen: false, tutorId: "", tutorName: "", newStatus: "active" });
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

  const columns: Column<Tutor>[] = [
    { key: "createdAt", label: "Date Join", width: "200px", type: "datetime" },
    { key: "name", label: "Nama Tutor", width: "150px" },
    { key: "email", label: "Email", width: "180px" },
    { key: "phoneNumber", label: "Nomor HP/WA", width: "150px" },
    {
      key: "status",
      label: "Status",
      width: "300px",
      render: (value) => {
        const status = String(value ?? "");
        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const rowActions: RowAction<Tutor>[] = [
    {
      label: "Details",
      variant: "outline",
      href: (row) => `/tutors/${row.id}`,
    },
    {
      label: "Verify",
      icon: <ShieldCheck className="w-4 h-4" />,
      variant: "default",
      onClick: (row) => handleStatusChange(row),
      show: (row) => row.status !== "active",
    },
    {
      label: "Deactivate",
      icon: <ShieldX className="w-4 h-4" />,
      variant: "outline",
      onClick: (row) => handleStatusChange(row),
      show: (row) => row.status === "active",
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
      onClick: (row) => router.push(`/tutors/form?id=${row.id}`),
    },
    {
      label: "",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "ghost",
      onClick: (row) => handleDeleteTutor(row.id),
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      render: () => (
        <Link href="/tutors/form">
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={isPending || isDeleting}
          >
            <Plus className="w-4 h-4" />
            Add Tutor
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

  const bulkActions: BulkAction<Tutor>[] = [
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
      <DataTable<Tutor>
        ref={dataTableRef}
        data={tutors}
        columns={columns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search tutors..."
        emptyMessage="No tutors found"
        serverSidePagination={true}
        currentPage={currentPage}
        totalItems={totalData}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        searchTerm={localSearchTerm}
        onSearchChange={handleSearchChange}
        isLoading={isPending || isDeleting || isChangingRole || isChangingStatus}
      />

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirm({ isOpen: open, tutorIds: [], count: 0 })
        }
        title={
          deleteConfirm.count === 1
            ? "Delete Tutor"
            : `Delete ${deleteConfirm.count} Tutors`
        }
        description={
          deleteConfirm.count === 1
            ? "Are you sure you want to delete this tutor? This action cannot be undone."
            : `Are you sure you want to delete ${deleteConfirm.count} tutors? This action cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={executeDelete}
      />

      <ConfirmDialog
        open={changeRoleConfirm.isOpen}
        onOpenChange={(open) =>
          setChangeRoleConfirm({ isOpen: open, tutorId: "", tutorName: "" })
        }
        title="Change Tutor Role"
        description={`Are you sure you want to change the role for ${changeRoleConfirm.tutorName}?`}
        confirmLabel="Change Role"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={executeChangeRole}
      />

      <ConfirmDialog
        open={statusConfirm.isOpen}
        onOpenChange={(open) =>
          setStatusConfirm({ isOpen: open, tutorId: "", tutorName: "", newStatus: "active" })
        }
        title={
          statusConfirm.newStatus === "active"
            ? "Verify Tutor"
            : "Deactivate Tutor"
        }
        description={
          statusConfirm.newStatus === "active"
            ? `Are you sure you want to verify and activate ${statusConfirm.tutorName}?`
            : `Are you sure you want to deactivate ${statusConfirm.tutorName}?`
        }
        confirmLabel={
          statusConfirm.newStatus === "active" ? "Verify" : "Deactivate"
        }
        cancelLabel="Cancel"
        variant={statusConfirm.newStatus === "active" ? "default" : "destructive"}
        onConfirm={executeStatusChange}
      />

      <TutorMessageDialog
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
