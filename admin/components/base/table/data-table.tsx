"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import TableBody from "./table-body";
import TableHeader from "./table-header";
import TablePagination from "./table-pagination";
import TableToolbar from "./table-toolbar";

export interface Column<T> {
  key: string;
  type?: "string" | "number" | "datetime" | "boolean" | "currency";
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  onClick?: (row: T) => void;
  href?: (row: T) => string;
  show?: (row: T) => boolean;
}

export interface ToolbarAction {
  render: () => React.ReactNode;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  onClick: (selectedRows: T[]) => void;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "text";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface DataTableRef {
  clearSelection: () => void;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  rowsPerPage?: number;
  showCheckboxes?: boolean;
  showPagination?: boolean;
  showToolbar?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  rowActions?: RowAction<T>[];
  toolbarActions?: ToolbarAction[];
  bulkActions?: BulkAction<T>[];
  onRowSelect?: (selectedRows: T[]) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  // Server-side pagination props
  serverSidePagination?: boolean;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  // Server-side search props
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  // Filter props
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  // Loading state
  isLoading?: boolean;
}

function DataTableInner<T extends Record<string, unknown>>(
  {
    data,
    columns,
    rowsPerPage = 10,
    showCheckboxes = true,
    showPagination = true,
    showToolbar = true,
    showSearch = true,
    searchPlaceholder = "Search...",
    rowActions = [],
    toolbarActions = [],
    bulkActions = [],
    onRowSelect,
    getRowId = (row: T) => String(row.id ?? row.ID ?? ""),
    emptyMessage = "No data available",
    serverSidePagination = false,
    currentPage: externalCurrentPage = 1,
    totalItems: externalTotalItems = 0,
    onPageChange: externalOnPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50, 100],
    searchTerm: externalSearchTerm,
    onSearchChange: externalOnSearchChange,
    filters = [],
    filterValues = {},
    onFilterChange,
    isLoading = false,
  }: DataTableProps<T>,
  ref: React.Ref<DataTableRef>
) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Expose clearSelection method to parent
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      setSelectedRows(new Set());
      setLastSelectedId(null);
      onRowSelect?.([]);
    },
  }));

  const currentPage = serverSidePagination
    ? externalCurrentPage
    : internalCurrentPage;
  const handlePageChange =
    serverSidePagination && externalOnPageChange
      ? externalOnPageChange
      : setInternalCurrentPage;

  const searchTerm =
    serverSidePagination && externalSearchTerm !== undefined
      ? externalSearchTerm
      : internalSearchTerm;

  const handleSearchChange =
    serverSidePagination && externalOnSearchChange
      ? externalOnSearchChange
      : setInternalSearchTerm;

  const filteredData = useMemo(() => {
    if (serverSidePagination) {
      return data;
    }

    let result = data;

    // Apply search filter (client-side only)
    if (showSearch && searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    return result;
  }, [data, searchTerm, showSearch, serverSidePagination]);

  const totalItems = serverSidePagination
    ? externalTotalItems
    : filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const paginatedData =
    serverSidePagination || !showPagination
      ? data
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const toggleRowSelection = useCallback(
    (id: string, event?: React.MouseEvent) => {
      if (!showCheckboxes) return;

      setSelectedRows((prev) => {
        const newSelection = new Set(prev);

        // Handle shift-click for range selection
        if (event?.shiftKey && lastSelectedId) {
          const currentIds = paginatedData.map(getRowId);
          const lastIndex = currentIds.indexOf(lastSelectedId);
          const currentIndex = currentIds.indexOf(id);

          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);

            for (let i = start; i <= end; i++) {
              newSelection.add(currentIds[i]);
            }
          }
        } else {
          // Regular toggle
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
        }

        setLastSelectedId(id);

        // Notify parent of selection change
        const selectedData = paginatedData.filter((row) =>
          newSelection.has(getRowId(row))
        );
        onRowSelect?.(selectedData);

        return newSelection;
      });
    },
    [showCheckboxes, lastSelectedId, paginatedData, getRowId, onRowSelect]
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => {
      const currentPageIds = paginatedData.map(getRowId);
      const allSelected = currentPageIds.every((id) => prev.has(id));

      const newSelection = new Set(prev);

      if (allSelected) {
        currentPageIds.forEach((id) => newSelection.delete(id));
      } else {
        currentPageIds.forEach((id) => newSelection.add(id));
      }

      // Notify parent of selection change
      const selectedData = paginatedData.filter((row) =>
        newSelection.has(getRowId(row))
      );
      onRowSelect?.(selectedData);

      return newSelection;
    });
  }, [paginatedData, getRowId, onRowSelect]);

  const selectedRowData = useMemo(
    () => paginatedData.filter((row) => selectedRows.has(getRowId(row))),
    [paginatedData, selectedRows, getRowId]
  );

  const handleBulkAction = useCallback(
    (action: BulkAction<T>) => {
      action.onClick(selectedRowData);
      // Don't clear selection here - let parent component control it
    },
    [selectedRowData]
  );

  const allCurrentPageSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((row) => selectedRows.has(getRowId(row)));
  }, [paginatedData, selectedRows, getRowId]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {showToolbar && (
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedCount={selectedRows.size}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          toolbarActions={toolbarActions}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          isLoading={isLoading}
        />
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader
              columns={columns}
              showCheckboxes={showCheckboxes}
              showActions={rowActions.length > 0}
              allSelected={allCurrentPageSelected}
              onSelectAll={toggleSelectAll}
            />
            <TableBody
              columns={columns}
              data={paginatedData}
              selectedRows={selectedRows}
              onRowSelect={toggleRowSelection}
              rowActions={rowActions}
              getRowId={getRowId}
              showCheckboxes={showCheckboxes}
            />
          </table>

          {/* Empty State */}
          {paginatedData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {isLoading ? "Loading..." : emptyMessage}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <
  T extends Record<string, unknown>
>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;
