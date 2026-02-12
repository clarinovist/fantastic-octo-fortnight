"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Column } from "./data-table";

interface TableHeaderProps<T> {
  columns: Column<T>[];
  allSelected: boolean;
  onSelectAll: () => void;
  showCheckboxes?: boolean;
  showActions?: boolean;
}

export default function TableHeader<T>({
  columns,
  allSelected,
  onSelectAll,
  showCheckboxes = true,
  showActions = false,
}: TableHeaderProps<T>) {
  return (
    <thead className="bg-muted border-b border-border">
      <tr>
        {/* Checkbox Column */}
        {showCheckboxes && (
          <th className="px-4 py-3 text-left font-semibold text-sm w-12">
            <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
          </th>
        )}

        {/* Data Columns */}
        {columns.map((column) => {
          return (
            <th
              key={column.key}
              style={{ width: column.width }}
              className="px-4 py-3 text-left font-semibold text-sm"
            >
              <div className="flex items-center gap-2">{column.label}</div>
            </th>
          );
        })}

        {/* Actions Column */}
        {showActions && (
          <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
        )}
      </tr>
    </thead>
  );
}
