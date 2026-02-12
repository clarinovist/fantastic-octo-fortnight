"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BulkAction, FilterConfig, ToolbarAction } from "./data-table";

interface TableToolbarProps<T> {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
  toolbarActions?: ToolbarAction[];
  bulkActions?: BulkAction<T>[];
  onBulkAction?: (action: BulkAction<T>) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  isLoading?: boolean;
}

export default function TableToolbar<T>({
  searchTerm,
  onSearchChange,
  selectedCount,
  showSearch = true,
  searchPlaceholder = "Search...",
  toolbarActions = [],
  bulkActions = [],
  onBulkAction,
  filters = [],
  filterValues = {},
  onFilterChange,
  isLoading = false,
}: TableToolbarProps<T>) {
  // Local state for text filters with debouncing
  const [localTextFilters, setLocalTextFilters] = useState<
    Record<string, string>
  >(() => {
    const textFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      if (filter.type === "text") {
        textFilters[filter.key] = filterValues[filter.key] || "";
      }
    });
    return textFilters;
  });

  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const isUserTypingRef = useRef<Record<string, boolean>>({});
  const prevFilterValuesRef = useRef<Record<string, string>>(filterValues);

  // Sync external filterValues to local state only when they change externally (not from user typing)
  useEffect(() => {
    filters.forEach((filter) => {
      if (filter.type === "text") {
        const key = filter.key;
        const newValue = filterValues[key] || "";
        const prevValue = prevFilterValuesRef.current[key] || "";

        // Only update if:
        // 1. User is not currently typing in this field
        // 2. Value has actually changed from previous external value
        // 3. Local value is different from new external value
        if (
          !isUserTypingRef.current[key] &&
          newValue !== prevValue &&
          localTextFilters[key] !== newValue
        ) {
          setLocalTextFilters((prev) => ({ ...prev, [key]: newValue }));
        }
      }
    });

    // Update ref to track current filterValues
    prevFilterValuesRef.current = filterValues;
  }, [filterValues, filters, localTextFilters]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const handleTextFilterChange = (key: string, value: string): void => {
    // Mark that user is typing in this field
    isUserTypingRef.current[key] = true;

    // Update local state immediately for responsive UI
    setLocalTextFilters((prev) => ({ ...prev, [key]: value }));

    // Clear existing timer for this filter
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }

    // Set new timer to trigger actual filter change
    debounceTimersRef.current[key] = setTimeout(() => {
      isUserTypingRef.current[key] = false;
      onFilterChange?.(key, value);
    }, 500);
  };

  const handleTextFilterClear = (key: string): void => {
    // Mark that user is not typing
    isUserTypingRef.current[key] = false;

    // Clear timer
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }

    // Update local state
    setLocalTextFilters((prev) => ({ ...prev, [key]: "" }));

    // Trigger immediate filter change
    onFilterChange?.(key, "");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      {showSearch && (
        <div className="flex-1 min-w-64 relative">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Filters */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          {filter.type === "select" && (
            <div className="flex items-center gap-1">
              <Select
                value={filterValues[filter.key] || ""}
                onValueChange={(value) => onFilterChange?.(filter.key, value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={filter.placeholder || filter.label}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterValues[filter.key] && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onFilterChange?.(filter.key, "")}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {filter.type === "text" && (
            <div className="flex items-center gap-1">
              <Input
                placeholder={filter.placeholder || filter.label}
                value={localTextFilters[filter.key] || ""}
                onChange={(e) =>
                  handleTextFilterChange(filter.key, e.target.value)
                }
                className="w-[180px]"
                disabled={isLoading}
              />
              {localTextFilters[filter.key] && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleTextFilterClear(filter.key)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Custom Toolbar Actions */}
      {toolbarActions.map((action, idx) => (
        <div key={idx}>{action.render()}</div>
      ))}

      {/* Bulk Actions (only shown when rows are selected) */}
      {selectedCount > 0 &&
        bulkActions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant || "outline"}
            size="sm"
            className="gap-2"
            onClick={() => onBulkAction?.(action)}
            disabled={isLoading}
          >
            {action.icon}
            {action.label}
            <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded">
              {selectedCount}
            </span>
          </Button>
        ))}
    </div>
  );
}
