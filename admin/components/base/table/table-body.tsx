"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatRupiah } from "@/utils/helpers";
import Link from "next/link";
import type { Column, RowAction } from "./data-table";

interface TableBodyProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  selectedRows: Set<string>;
  onRowSelect: (id: string, event?: React.MouseEvent) => void;
  rowActions?: RowAction<T>[];
  getRowId: (row: T) => string;
  showCheckboxes?: boolean;
}

export default function TableBody<T extends Record<string, unknown>>({
  columns,
  data,
  selectedRows,
  onRowSelect,
  rowActions = [],
  getRowId,
  showCheckboxes = true,
}: TableBodyProps<T>) {
  return (
    <tbody className="divide-y divide-border">
      {data.map((row) => {
        const rowId = getRowId(row);
        const isSelected = selectedRows.has(rowId);

        return (
          <tr
            key={rowId}
            onClick={(e) => {
              if (
                !showCheckboxes ||
                (e.target as HTMLElement).closest("button") ||
                (e.target as HTMLElement).closest("a") ||
                (e.target as HTMLElement)
                  .closest("td")
                  ?.classList.contains("checkbox-cell")
              ) {
                return;
              }
              onRowSelect(rowId, e);
            }}
            className={`transition-colors ${
              showCheckboxes ? "cursor-pointer" : ""
            } ${
              isSelected
                ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                : "hover:bg-muted/30"
            }`}
          >
            {/* Checkbox */}
            {showCheckboxes && (
              <td
                className="px-4 py-3 checkbox-cell"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowSelect(rowId, e);
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {
                    // This will be handled by the td onClick
                  }}
                />
              </td>
            )}

            {/* Data Cells */}
            {columns.map((column) => {
              const value = row[column.key];
              return (
                <td
                  key={column.key}
                  style={{ width: column.width }}
                  className="px-4 py-3 text-sm"
                >
                  {column.render
                    ? column.render(value, row)
                    : column?.type === "datetime"
                    ? formatDate(value as string, { withTime: true })
                    : column.type === "currency"
                    ? formatRupiah(value as number | string)
                    : String(value ?? "")}
                </td>
              );
            })}

            {/* Actions */}
            {rowActions.length > 0 && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {rowActions.map((action, idx) => {
                    const shouldShow = action.show ? action.show(row) : true;
                    if (!shouldShow) return null;

                    if (action.href) {
                      return (
                        <Button
                          key={idx}
                          variant={action.variant || "outline"}
                          size="sm"
                          asChild
                        >
                          <Link href={action.href(row)}>
                            {action.icon}
                            {action.label}
                          </Link>
                        </Button>
                      );
                    }

                    return (
                      <Button
                        key={idx}
                        variant={action.variant || "outline"}
                        size="sm"
                        onClick={() => action.onClick?.(row)}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
}
