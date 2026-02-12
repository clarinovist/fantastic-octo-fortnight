"use client";

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
import type { Booking } from "@/utils/types";
import {
  ArrowDownAZ,
  ArrowDownZA,
  Calendar,
  ChevronDown,
  SortAsc,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";

type BookingListProps = {
  bookings: Booking[];
  totalData: number;
  currentPage?: number;
  pageSize?: number;
};

const SORT_OPTIONS = [
  { label: "By Tanggal Booking", value: "booking_date", icon: Calendar },
];

const SORT_OPTIONS_DIRECTION = [
  { label: "A - Z", value: "ASC", icon: ArrowDownAZ },
  { label: "Z - A", value: "DESC", icon: ArrowDownZA },
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

export function BookingList({
  bookings,
  totalData,
  currentPage = 1,
  pageSize = 10,
}: BookingListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTableRef = useRef<DataTableRef>(null);
  const [isPending, startTransition] = useTransition();

  // Get current sort state from URL
  const currentSortBy = searchParams.get("sort") || "";
  const currentSortOrder = searchParams.get("sortDirection") || "";

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

  const columns: Column<Booking>[] = [
    {
      key: "bookingDate",
      label: "Tanggal Booking",
      width: "200px",
      type: "datetime",
    },
    {
      key: "studentName",
      label: "Student",
      width: "150px",
      type: "string",
    },
    {
      key: "tutorName",
      label: "Tutor",
      width: "180px",
      type: "string",
    },
    { key: "courseTitle", label: "Title", width: "150px" },
    {
      key: "status",
      label: "Status",
      width: "300px",
      render: (value) => {
        const status = String(value ?? "");
        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === "accepted"
                ? "bg-green-100 text-green-800"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "declined"
                ? "bg-red-100 text-red-800"
                : status === "expired"
                ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const rowActions: RowAction<Booking>[] = [
    {
      label: "Details",
      variant: "outline",
      href: (row) => `/bookings/${row.id}`,
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
      key: "tutorName",
      label: "Tutor Name",
      type: "text",
      placeholder: "Filter by tutor",
    },
    {
      key: "studentName",
      label: "Student Name",
      type: "text",
      placeholder: "Filter by student",
    },
  ];

  const filterValues = useMemo(
    () => ({
      status: searchParams.get("status") || "",
      tutorName: searchParams.get("tutorName") || "",
      studentName: searchParams.get("studentName") || "",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isPending}
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
      <DataTable<Booking>
        ref={dataTableRef}
        data={bookings}
        columns={columns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        showSearch={false}
        emptyMessage="No bookings found"
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
        isLoading={isPending}
      />
    </>
  );
}
