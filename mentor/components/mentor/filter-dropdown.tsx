"use client";
import * as React from "react";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    title?: string;
    options: FilterOption[];
    selectedValues: string[];
    onSelect: (values: string[]) => void;
    align?: "start" | "end" | "center";
}

export function FilterDropdown({
    title = "Filter",
    options,
    selectedValues,
    onSelect,
    align = "start",
}: FilterDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues?.length > 0 && (
                        <>
                            <div className="mx-2 h-4 w-[1px] bg-accent" />
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.length > 2 ? (
                                    <span className="text-secondary-foreground rounded-sm px-1 font-normal text-xs bg-secondary">
                                        {selectedValues.length} selected
                                    </span>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.includes(option.value))
                                        .map((option) => (
                                            <span
                                                key={option.value}
                                                className="text-secondary-foreground rounded-sm px-1 font-normal text-xs bg-secondary"
                                            >
                                                {option.label}
                                            </span>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-[200px]">
                <DropdownMenuLabel>{title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                        <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={isSelected}
                            onCheckedChange={() => {
                                if (isSelected) {
                                    onSelect(selectedValues.filter((v) => v !== option.value));
                                } else {
                                    onSelect([...selectedValues, option.value]);
                                }
                            }}
                        >
                            {option.label}
                        </DropdownMenuCheckboxItem>
                    );
                })}
                {selectedValues.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            onCheckedChange={() => onSelect([])}
                            className="justify-center text-center"
                        >
                            Clear filters
                        </DropdownMenuCheckboxItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
