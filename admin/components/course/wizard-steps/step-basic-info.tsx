"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MultipleSelect } from "@/components/ui/multiple-select";
import { useState, useEffect } from "react";
import { CourseWizardData } from "../course-wizard";
import { Tutor, CourseCategory } from "@/utils/types";
import { Bold, Italic, Underline, List, ListOrdered, Link, ImageIcon, Search, X } from "lucide-react";

import Image from "next/image";

const GRADES = [
    ["TK", "SD", "SMP", "SMA"],
    ["MI", "MTs", "MTA"],
    ["SMK"]
];

interface StepBasicInfoProps {
    categories: CourseCategory[];
    tutors: Tutor[];
}

export function StepBasicInfo({ categories, tutors }: StepBasicInfoProps) {
    const { control, watch, setValue } = useFormContext<CourseWizardData>();
    const selectedTutorId = watch("tutorId");
    const courseCategoryID = watch("courseCategoryID");
    const selectedTutor = tutors.find(t => t.id === selectedTutorId);

    const [subCategoryOptions, setSubCategoryOptions] = useState<{ id: string; label: string }[]>([]);
    const [subCategoryKey, setSubCategoryKey] = useState(0);

    // Fetch initial subcategories when category changes
    useEffect(() => {
        if (courseCategoryID) {
            setTimeout(() => setSubCategoryKey(prev => prev + 1), 0);
            fetch(`/api/v1/course-categories/${courseCategoryID}/sub?page=1`)
                .then(res => res.json())
                .then(({ data }) => {
                    const options = data?.map((item: { id: string; name: string }) => ({ id: item.id, label: item.name })) || [];
                    setSubCategoryOptions(options);
                })
                .catch(() => { /* ignore */ });
        } else {
            setTimeout(() => setSubCategoryOptions([]), 0);
        }
    }, [courseCategoryID]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Section: Core Details */}
            <div className="space-y-6">
                {/* Course Title */}
                <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Course Title <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Advanced Mathematics for High School"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary text-lg py-3 px-4 shadow-sm placeholder:text-gray-400"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Description</FormLabel>
                            <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                {/* Rich Text Toolbar */}
                                <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Bold"><Bold className="size-5" /></button>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Italic"><Italic className="size-5" /></button>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Underline"><Underline className="size-5" /></button>
                                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Bulleted List"><List className="size-5" /></button>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Numbered List"><ListOrdered className="size-5" /></button>
                                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Link"><Link className="size-5" /></button>
                                    <button type="button" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors" title="Image"><ImageIcon className="size-5" /></button>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter a detailed overview of the curriculum..."
                                        className="w-full border-0 bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-gray-200 focus:ring-0 min-h-[160px] resize-y"
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500 text-right">{field.value?.length || 0} / 2000 characters</p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section: Classification */}
            <div className="space-y-6">
                {/* Category / Course Function */}
                <FormField
                    control={control}
                    name="courseCategoryID"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course Function</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm px-4">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Sub-Categories / Labels */}
                <FormField
                    control={control}
                    name="subCategoryIDs"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Sub-Categories</FormLabel>
                            <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 min-h-[140px]">
                                <MultipleSelect
                                    key={subCategoryKey}
                                    options={[...new Map(subCategoryOptions.map(o => [o.id, o])).values()]}
                                    value={field.value || []}
                                    onLoadMore={async (page) => {
                                        if (!courseCategoryID) return [];
                                        try {
                                            const res = await fetch(`/api/v1/course-categories/${courseCategoryID}/sub?page=${page}`);
                                            const { data } = await res.json();
                                            const newOptions = data?.map((item: { id: string; name: string }) => ({ id: item.id, label: item.name })) || [];
                                            setSubCategoryOptions(prev => {
                                                const existingIds = new Set(prev.map(o => o.id));
                                                const uniqueNew = newOptions.filter((o: { id: string }) => !existingIds.has(o.id));
                                                return [...prev, ...uniqueNew];
                                            });
                                            return newOptions;
                                        } catch {
                                            return [];
                                        }
                                    }}
                                    onSelectionChange={field.onChange}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="space-y-6">
                {/* Education Level */}
                <FormField
                    control={control}
                    name="levelEducationCourses"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Education Level</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {GRADES.map((column, colIdx) => (
                                    <div key={colIdx} className="space-y-3">
                                        {column.map((grade) => (
                                            <div key={grade} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`grade-admin-${grade}`}
                                                    checked={field.value?.includes(grade)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            field.onChange([...(field.value || []), grade])
                                                        } else {
                                                            field.onChange(field.value?.filter((g: string) => g !== grade))
                                                        }
                                                    }}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <Label htmlFor={`grade-admin-${grade}`} className="text-sm font-medium leading-none cursor-pointer">
                                                    {grade}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section: Instructor */}
            <div className="max-w-md space-y-4">
                <FormField
                    control={control}
                    name="tutorId"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Assign Primary Tutor</FormLabel>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Search className="size-5" />
                                </span>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full h-12 pl-10 pr-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                            <SelectValue placeholder="Search tutor by name..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tutors.map(tutor => (
                                            <SelectItem key={tutor.id} value={tutor.id}>{tutor.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Search Result / Selected State Preview */}
                {selectedTutor && (
                    <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover border border-white dark:border-gray-700 overflow-hidden relative shadow-sm">
                                    {selectedTutor.photoProfile ? (
                                        <Image
                                            src={selectedTutor.photoProfile}
                                            alt={selectedTutor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                            {selectedTutor.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedTutor.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Senior Design Instructor</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue("tutorId", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
