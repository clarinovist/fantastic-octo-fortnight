"use client";

import { deleteCourseAction } from "@/actions/course";
import { ConfirmDialog } from "@/components/base/confirm-dialog";
import type {
  Column,
  FilterConfig,
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
import { cn } from "@/lib/utils";
import type { Course, CourseStatus } from "@/utils/types";
import {
  ArrowDownAZ,
  ArrowDownZA,
  ChevronDown,
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

type CourseListProps = {
  courses: Course[];
  totalData: number;
  currentPage?: number;
  pageSize?: number;
};

type DeleteConfirmState = {
  isOpen: boolean;
  courseId: string;
  courseTitle: string;
};

const SORT_OPTIONS = [
  { label: "Tutor Name", value: "tutor_name", icon: User },
  { label: "Updated At", value: "updated_at", icon: SortAsc },
];

const SORT_OPTIONS_DIRECTION = [
  { label: "A - Z", value: "ASC", icon: ArrowDownAZ },
  { label: "Z - A", value: "DESC", icon: ArrowDownZA },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Waiting for Approval", value: "Waiting for Approval" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

export function CourseList({
  courses,
  totalData,
  currentPage = 1,
  pageSize = 10,
}: CourseListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTableRef = useRef<DataTableRef>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    courseId: "",
    courseTitle: "",
  });

  // Get current sort state from URL
  const currentSortBy = searchParams.get("sort") || "";
  const currentSortOrder = searchParams.get("sortDirection") || "";

  const handleDeleteCourse = (course: Course): void => {
    setDeleteConfirm({
      isOpen: true,
      courseId: course.id,
      courseTitle: course.courseTitle,
    });
  };

  const executeDelete = async (): Promise<void> => {
    const { courseId } = deleteConfirm;

    setIsDeleting(true);
    try {
      const result = await deleteCourseAction(courseId);

      if (result.success) {
        toast.success("Course deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete course");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, courseId: "", courseTitle: "" });
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

  const columns: Column<Course>[] = [
    {
      key: "tutorName",
      label: "Tutor",
      width: "300px",
      type: "string",
    },
    {
      key: "courseTitle",
      label: "Title",
      width: "300px",
      type: "string",
    },
    {
      key: "classType",
      label: "Class Type",
      width: "200px",
      render: (value: unknown) => {
        const classType = value as "all" | "online" | "offline";
        return (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium capitalize",
              classType === "online"
                ? "bg-blue-100 text-blue-800"
                : classType === "offline"
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            )}
          >
            {classType || "-"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: "300px",
      render: (value: unknown) => {
        const status = value as CourseStatus;
        const statusClassName: Record<CourseStatus, string> = {
          Draft: "bg-gray-100 text-gray-800",
          "Waiting for Approval": "bg-blue-100 text-blue-800",
          Accepted: "bg-green-100 text-green-800",
          Rejected: "bg-red-100 text-red-800",
        };
        const className =
          statusClassName[status] || "bg-gray-100 text-gray-800";
        return (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              className
            )}
          >
            {status || "-"}
          </span>
        );
      },
    },
    {
      key: "isFreeFirstCourse",
      label: "Free First Course",
      width: "200px",
      render: (value: unknown) => {
        const isFree = value as boolean;
        return (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              isFree ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}
          >
            {isFree ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      width: "250px",
      type: "datetime",
    },
  ];

  const rowActions: RowAction<Course>[] = [
    {
      label: "Details",
      variant: "outline",
      href: (row) => `/courses/${row.id}`,
    },
    {
      label: "",
      icon: <SquarePen className="w-4 h-4" />,
      variant: "ghost",
      onClick: (row) => router.push(`/courses/${row.id}/edit`),
    },
    {
      label: "",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "ghost",
      onClick: (row) => handleDeleteCourse(row),
    },
  ];

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Filter by status",
      options: STATUS_OPTIONS,
    },
    {
      key: "classType",
      label: "Class Type",
      type: "select",
      options: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
      placeholder: "Class type",
    },
    {
      key: "isFreeFirstCourse",
      label: "Free First Course",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      placeholder: "Free first course",
    },
  ];

  const filterValues = useMemo(
    () => ({
      status: searchParams.get("status") || "",
      isFreeFirstCourse: searchParams.get("isFreeFirstCourse") || "",
      classType: searchParams.get("classType") || "",
    }),
    [searchParams]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (value) {
            params.set(key, value);
          } else {
            params.delete(key);
          }
          params.set("page", "1");
          router.push(`?${params.toString()}`);
        });
      }, 500);
    },
    [router, searchParams]
  );

  const toolbarActions: ToolbarAction[] = [
    {
      render: () => (
        <Link href="/courses/create">
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={isPending || isDeleting}
          >
            <Plus className="w-4 h-4" />
            Add Course
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

  return (
    <>
      <DataTable<Course>
        ref={dataTableRef}
        data={courses}
        columns={columns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        showSearch={false}
        emptyMessage="No courses found"
        serverSidePagination={true}
        currentPage={currentPage}
        totalItems={totalData}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        isLoading={isPending || isDeleting}
      />

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirm({ isOpen: open, courseId: "", courseTitle: "" })
        }
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteConfirm.courseTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={executeDelete}
      />
    </>
  );
}
