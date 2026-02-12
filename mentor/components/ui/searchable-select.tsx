"use client";

import { Input } from "@/components/ui/input";
import type { Metadata } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";

interface SearchableSelectProps<T> {
  placeholder: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  showIconInItems?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: T) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  apiEndpoint: string;
  getDisplayText: (item: T) => string;
  getSecondaryText?: (item: T) => string | null;
  className?: string;
  dropdownClassName?: string;
  renderItem?: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  forceShowDropdown?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  clearOnFocus?: boolean; // Clear input when focusing after selection
  showAllOnFocus?: boolean; // Show all items instead of filtered results when focusing
}

interface ApiResponse<T> {
  data: T[];
  metadata: Metadata;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SearchableSelect<T extends { id: string | number }>({
  placeholder,
  icon,
  iconPosition = "left",
  showIconInItems = true,
  value,
  onChange,
  onSelect,
  onFocus,
  onBlur,
  apiEndpoint,
  getDisplayText,
  getSecondaryText,
  className = "",
  dropdownClassName = "",
  renderItem,
  forceShowDropdown = true,
  autoFocus = false,
  disabled = false,
  clearOnFocus = false,
  showAllOnFocus = false,
}: SearchableSelectProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const currentObserver = useRef<IntersectionObserver | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when component mounts if autoFocus is true and not disabled
  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const getKey = (
    pageIndex: number,
    previousPageData: ApiResponse<T> | null
  ) => {
    // Don't fetch if disabled, user hasn't interacted with the component yet or if forced to not show dropdown
    if (disabled || !hasInteracted || !forceShowDropdown) return null;

    if (previousPageData && previousPageData.metadata) {
      const totalPages = Math.ceil(
        previousPageData.metadata.total / previousPageData.metadata.pageSize
      );
      if (pageIndex >= totalPages) return null;
    }

    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      pageSize: "10",
      // Only add search query if not showing all items or if there's no value
      ...(value && !showAllItems && { q: value }),
    });

    return `${apiEndpoint}?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating, isLoading } =
    useSWRInfinite<ApiResponse<T>>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const items = data?.flatMap((page) => page.data) ?? [];
  const isLoadingMore =
    isValidating && size > 0 && data && typeof data[size - 1] === "undefined";
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data &&
      data[data.length - 1] &&
      data[data.length - 1].metadata &&
      data[data.length - 1].metadata.page >=
        Math.ceil(
          data[data.length - 1].metadata.total /
            data[data.length - 1].metadata.pageSize
        ));

  // Infinite scroll observer
  useEffect(() => {
    // Disconnect existing observer
    if (currentObserver.current) {
      currentObserver.current.disconnect();
      currentObserver.current = null;
    }

    // Don't set up observer if disabled, we're searching or if there's no element or if forced to not show dropdown
    if (
      disabled ||
      !observerRef.current ||
      isSearching ||
      isLoadingMore ||
      isReachingEnd ||
      !hasInteracted ||
      !forceShowDropdown
    ) {
      return;
    }

    // Add a small delay to prevent immediate triggering after search
    const timeoutId = setTimeout(() => {
      if (!observerRef.current || isSearching || !forceShowDropdown || disabled)
        return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !isLoadingMore &&
            !isReachingEnd &&
            !isSearching &&
            forceShowDropdown &&
            !disabled
          ) {
            setSize(size + 1);
          }
        },
        { threshold: 0.1 }
      );

      currentObserver.current = observer;
      observer.observe(observerRef.current);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (currentObserver.current) {
        currentObserver.current.disconnect();
        currentObserver.current = null;
      }
    };
  }, [
    size,
    isLoadingMore,
    isReachingEnd,
    setSize,
    isSearching,
    hasInteracted,
    forceShowDropdown,
    disabled,
  ]);

  const handleSearchChange = (newValue: string) => {
    if (disabled) return;

    setIsSearching(true);
    setShowAllItems(false); // Reset show all items when user types
    onChange(newValue);

    // Only show dropdown if forceShowDropdown is true and not disabled
    if (forceShowDropdown && !disabled) {
      setShowDropdown(true);
    }

    setSelectedIndex(-1);

    // Mark as interacted if not already and if forceShowDropdown is true and not disabled
    if (!hasInteracted && forceShowDropdown && !disabled) {
      setHasInteracted(true);
    }

    // Disconnect observer before resetting pagination
    if (currentObserver.current) {
      currentObserver.current.disconnect();
      currentObserver.current = null;
    }

    // Reset pagination when search changes (only if forceShowDropdown is true and not disabled)
    if (forceShowDropdown && !disabled) {
      setSize(1);
    }

    // Re-enable observer after a delay
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleSuggestionClick = (item: T) => {
    if (disabled) return;

    onChange(getDisplayText(item));
    setShowDropdown(false);
    setSelectedIndex(-1);
    setShowAllItems(false);
    onSelect?.(item);
  };

  const handleInputFocus = () => {
    if (disabled) return;

    // Clear input if clearOnFocus is enabled
    if (clearOnFocus) {
      onChange("");
      setShowAllItems(false);
    } else if (showAllOnFocus) {
      // Show all items instead of filtered results
      setShowAllItems(true);
    }

    // Only show dropdown if forceShowDropdown is true and not disabled
    if (forceShowDropdown && !disabled) {
      setShowDropdown(true);
      // Mark as interacted and trigger initial load if needed
      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Reset pagination to trigger fresh data fetch
      setSize(1);
    }

    // Call parent onFocus if provided
    onFocus?.();
  };

  const handleInputBlur = () => {
    if (disabled) return;

    setTimeout(() => {
      setShowDropdown(false);
      setShowAllItems(false);
    }, 200);
    // Call parent onBlur if provided
    onBlur?.();
  };

  // Override showDropdown based on forceShowDropdown prop and disabled state
  const shouldShowDropdown =
    forceShowDropdown && showDropdown && hasInteracted && !disabled;

  const defaultRenderItem = (item: T, index: number, isSelected: boolean) => {
    const secondaryText = getSecondaryText?.(item);

    return (
      <button
        key={item.id}
        onClick={() => handleSuggestionClick(item)}
        disabled={disabled}
        className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-gray-100 ${
          isSelected ? "bg-purple-100" : ""
        } ${disabled ? "cursor-not-allowed opacity-100" : ""}`}
      >
        {showIconInItems && icon && iconPosition === "left" && icon}
        <span className="text-gray-700 flex-1">
          <span className="text-black font-medium">{getDisplayText(item)}</span>
          {secondaryText && (
            <span className="text-gray-500 text-sm block">{secondaryText}</span>
          )}
        </span>
        {showIconInItems && icon && iconPosition === "right" && icon}
      </button>
    );
  };

  return (
    <div
      className={`flex items-center gap-2 flex-1 relative ${
        disabled ? "opacity-100" : ""
      } ${className}`}
    >
      {icon && iconPosition === "left" && icon}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={`disabled:opacity-100 placeholder:font-bold border-none shadow-none bg-transparent font-bold focus-visible:ring-0 px-0 ${
          disabled ? "cursor-not-allowed" : ""
        }`}
        value={value}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
      />
      {icon && iconPosition === "right" && icon}

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-10 max-h-80 overflow-y-auto ${dropdownClassName}`}
        >
          {error && (
            <div className="px-6 py-3 text-red-500 text-sm">
              Error loading data. Please try again.
            </div>
          )}

          {items.length > 0 && (
            <>
              {items.map((item, index) =>
                renderItem
                  ? renderItem(item, index, index === selectedIndex)
                  : defaultRenderItem(item, index, index === selectedIndex)
              )}

              {/* Infinite scroll trigger */}
              {!isSearching && <div ref={observerRef} className="h-1" />}

              {/* Loading indicator */}
              {isLoadingMore && !isReachingEnd && (
                <div className="px-6 py-3 text-center text-gray-500 text-sm">
                  Loading more...
                </div>
              )}

              {/* End of results indicator */}
              {isReachingEnd && items.length > 0 && (
                <div className="px-6 py-2 text-center text-gray-400 text-xs">
                  No more items to load
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {isEmpty && !isLoading && (
            <div className="px-6 py-3 text-gray-500 text-sm">
              {value && !showAllItems
                ? `No items found for "${value}"`
                : "No items available"}
            </div>
          )}

          {/* Initial loading state */}
          {isLoading && items.length === 0 && (
            <div className="px-6 py-3 text-center text-gray-500 text-sm">
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
