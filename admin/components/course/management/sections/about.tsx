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
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tutor } from "@/utils/types";
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

interface AboutSectionProps {
    form: UseFormReturn<FormData>;
    isEditMode: boolean;
}

export function AboutSection({ form, isEditMode }: AboutSectionProps) {
    const [searchTutorValue, setSearchTutorValue] = useState("");

    return (
        <div className="relative">
            <section>
                <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                    <div className="space-y-6 md:min-w-[560px] min-w-full">
                        <h3 className="text-2xl mb-10 font-bold">
                            Tentang Course dan Tutor
                        </h3>

                        {/* Tutor Selection - Only show in create mode */}
                        {!isEditMode && (
                            <FormField
                                control={form.control}
                                name="tutorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">
                                            Pilih Tutor <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="w-full rounded-md border px-3 py-1 bg-white focus:outline-none focus-visible:ring-black focus-visible:border-black">
                                                <SearchableSelect<Tutor>
                                                    placeholder="Cari Tutor"
                                                    icon={<SearchIcon />}
                                                    iconPosition="right"
                                                    value={searchTutorValue}
                                                    showAllOnFocus
                                                    onChange={setSearchTutorValue}
                                                    apiEndpoint="/api/v1/admin/tutors"
                                                    getDisplayText={(tutor) => tutor.name}
                                                    dropdownClassName="left-0 right-0 w-full"
                                                    renderItem={(tutor, _, isSelected) => (
                                                        <button
                                                            key={tutor.id}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSearchTutorValue(tutor.name);
                                                                field.onChange(tutor.id);
                                                            }}
                                                            className={`w-full px-6 py-1 text-left flex items-center gap-3 ${isSelected ? "bg-purple-100" : ""
                                                                }`}
                                                        >
                                                            <span className="text-gray-700">
                                                                <span className="text-black font-medium">
                                                                    {tutor.name}
                                                                </span>
                                                                <span className="block text-xs text-gray-500">
                                                                    {tutor.email}
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
                        )}

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Judul Course
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={8}
                                                maxLength={150}
                                                className="min-h-32"
                                            />
                                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                {field.value?.length || 0}/150
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Tentang Course
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={8}
                                                maxLength={150}
                                                className="min-h-32"
                                            />
                                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                {field.value?.length || 0}/150
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tutorDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Tentang Tutor
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={8}
                                                maxLength={150}
                                                className="min-h-32"
                                            />
                                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                {field.value?.length || 0}/150
                                            </div>
                                        </div>
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
