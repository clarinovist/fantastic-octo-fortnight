"use client";

import { Search, ChevronDown } from "lucide-react";

type FilterOption = {
    value: string;
    label: string;
};

type Filter = {
    name: string;
    label: string;
    options: FilterOption[];
    defaultValue?: string;
    disabled?: boolean;
};

type SearchToolbarProps = {
    placeholder?: string;
    queryParamName?: string;
    defaultQuery?: string;
    filters?: Filter[];
    children?: React.ReactNode;
};

export function SearchToolbar({
    placeholder = "Search...",
    queryParamName = "q",
    defaultQuery = "",
    filters = [],
    children,
}: SearchToolbarProps) {
    return (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                    <input
                        type="text"
                        name={queryParamName}
                        defaultValue={defaultQuery}
                        placeholder={placeholder}
                        className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
                    />
                </div>

                {/* Filters */}
                {filters.map((filter) => (
                    <div
                        key={filter.name}
                        className={`relative group min-w-[140px] ${filter.disabled ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        <div className="relative">
                            <select
                                name={filter.name}
                                defaultValue={filter.defaultValue || "all"}
                                className="w-full h-10 pl-4 pr-10 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                {filter.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                        </div>
                    </div>
                ))}

                <button type="submit" className="hidden">Submit</button>
            </form>

            {/* Extra controls slot */}
            {children && (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {children}
                </div>
            )}
        </div>
    );
}
