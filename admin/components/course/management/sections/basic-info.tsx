"use client";

import { UseFormReturn } from "react-hook-form";
import { FormData } from "../form-schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultipleSelect } from "@/components/ui/multiple-select";
import { useState } from "react";

const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M11.7428 10.3455C12.7119 9.02838 13.1623 7.38069 12.9974 5.73733C12.8325 4.09396 12.0654 2.57522 10.8496 1.48269C9.63373 0.390156 8.05619 -0.17773 6.44623 -0.0491047C4.83627 0.0795207 3.34621 0.860428 2.29519 2.13692C1.24418 3.41342 0.71353 5.08362 0.815059 6.78086C0.916589 8.4781 1.64362 10.0663 2.8503 11.2044C4.05698 12.3424 5.65414 12.9476 7.30303 12.8881C8.95193 12.8286 10.5019 12.1095 11.6285 10.8812L11.7428 10.3455ZM11.7428 10.3455L15.1499 13.9998"
            stroke="black"
            strokeOpacity="0.2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

interface BasicInfoSectionProps {
    form: UseFormReturn<FormData>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
    const [searchCategoryValue, setSearchCategoryValue] = useState("");
    const [categorySelected, setCategorySelected] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [subCategoryHasMore, setSubCategoryHasMore] = useState(true);
    const [subCategoryOptions, setSubCategoryOptions] = useState<
        Array<{ id: string; label: string }>
    >([]);
    const [subCategoryKey, setSubCategoryKey] = useState(0);

    return (
        <div className="relative">
            <section>
                <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                    <div className="space-y-6 md:min-w-[560px] min-w-full">
                        <h3 className="text-2xl mb-10 font-bold">
                            Tingkat dan Subjek/Mata pelajaran
                        </h3>
                        <FormField
                            control={form.control}
                            name="levelEducationCourses"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Pilih tingkat
                                    </FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    "TK",
                                                    "SD",
                                                    "SMP",
                                                    "SMA",
                                                    "MI",
                                                    "MTs",
                                                    "MTA",
                                                    "SMK",
                                                ].map((grade) => {
                                                    const id = `targetGrade-${grade.toLowerCase()}`;
                                                    const isChecked = (field.value || []).includes(
                                                        grade
                                                    );
                                                    return (
                                                        <div
                                                            key={grade}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={id}
                                                                checked={!!isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    const currentValue = field.value || [];
                                                                    let newValue: string[];
                                                                    if (checked === true) {
                                                                        newValue = [...currentValue, grade];
                                                                    } else {
                                                                        newValue = currentValue.filter(
                                                                            (g) => g !== grade
                                                                        );
                                                                    }
                                                                    field.onChange(newValue);
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={id}
                                                                className="text-sm select-none cursor-pointer"
                                                            >
                                                                {grade}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="courseCategoryID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Pilih subjek
                                    </FormLabel>
                                    <FormControl>
                                        <div className="w-full rounded-md border px-3 py-1 bg-white focus:outline-none focus-visible:ring-black focus-visible:border-black">
                                            <SearchableSelect<{ id: string; name: string }>
                                                placeholder="Pilih Subjek"
                                                icon={<SearchIcon />}
                                                iconPosition="right"
                                                value={searchCategoryValue}
                                                showAllOnFocus
                                                onChange={setSearchCategoryValue}
                                                apiEndpoint="/api/v1/course-categories"
                                                getDisplayText={(category) => category.name}
                                                dropdownClassName="left-0 right-0 w-full"
                                                renderItem={(category, _, isSelected) => (
                                                    <button
                                                        key={category.id}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setCategorySelected(category);
                                                            setSearchCategoryValue(category.name);
                                                            field.onChange(category.id);
                                                            form.setValue("subCategoryIDs", []);
                                                            setSubCategoryKey((prev) => prev + 1);
                                                            setSubCategoryHasMore(true);
                                                            setSubCategoryOptions([]);
                                                        }}
                                                        className={`w-full px-6 py-3 text-left flex items-center gap-3 ${isSelected ? "bg-purple-100" : ""
                                                            }`}
                                                    >
                                                        <span className="text-gray-700">
                                                            <span className="text-black font-medium">
                                                                {category.name}
                                                            </span>
                                                        </span>
                                                    </button>
                                                )}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subCategoryIDs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Pilih sub-subjek
                                    </FormLabel>
                                    <FormControl>
                                        <MultipleSelect
                                            key={subCategoryKey}
                                            options={subCategoryOptions}
                                            value={field.value || []}
                                            onLoadMore={async (page) => {
                                                if (!categorySelected) {
                                                    setSubCategoryHasMore(false);
                                                    return [];
                                                }
                                                try {
                                                    const response = await fetch(
                                                        `/api/v1/course-categories/${categorySelected.id}/sub?page=${page}`,
                                                        {
                                                            next: { revalidate: 0 },
                                                        }
                                                    );
                                                    const { data } = await response.json();
                                                    const newOptions =
                                                        data?.map(
                                                            (item: { id: string; name: string }) => ({
                                                                id: item.id,
                                                                label: item.name,
                                                            })
                                                        ) || [];
                                                    setSubCategoryOptions((prev) => {
                                                        const ids = new Set(
                                                            prev.map((opt) => opt.id)
                                                        );
                                                        const filtered = newOptions.filter(
                                                            (opt: { id: string; name: string }) =>
                                                                !ids.has(opt.id)
                                                        );
                                                        return filtered.length > 0
                                                            ? [...prev, ...filtered]
                                                            : prev;
                                                    });
                                                    setSubCategoryHasMore(newOptions.length === 20);
                                                    return newOptions;
                                                } catch {
                                                    setSubCategoryHasMore(false);
                                                    return [];
                                                }
                                            }}
                                            onSelectionChange={(selectedIds) => {
                                                field.onChange(selectedIds);
                                            }}
                                            hasMore={subCategoryHasMore}
                                            pageSize={20}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
