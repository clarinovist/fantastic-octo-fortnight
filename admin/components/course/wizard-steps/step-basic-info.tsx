"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseWizardData } from "../course-wizard";
import { Tutor, CourseCategory } from "@/utils/types";
import { Bold, Italic, Underline, List, ListOrdered, Link, ImageIcon, Search, X } from "lucide-react";

import Image from "next/image";

interface StepBasicInfoProps {
    categories: CourseCategory[];
    tutors: Tutor[];
}

export function StepBasicInfo({ categories, tutors }: StepBasicInfoProps) {
    const { control, watch, setValue } = useFormContext<CourseWizardData>();
    const selectedTutorId = watch("tutorId");
    const selectedTutor = tutors.find(t => t.id === selectedTutorId);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div className="relative w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 flex flex-wrap gap-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all min-h-[44px]">
                                {field.value?.map((id) => (
                                    <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
                                        <span>{id}</span>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange(field.value.filter(v => v !== id))}
                                            className="hover:text-primary-dark transition-colors"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    className="flex-1 min-w-[80px] bg-transparent border-none focus:ring-0 text-sm p-1 placeholder:text-gray-400"
                                    placeholder="Add tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !field.value.includes(val)) {
                                                field.onChange([...field.value, val]);
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Education Level */}
                <FormField
                    control={control}
                    name="levelEducationCourses"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">Education Level</FormLabel>
                            <Select
                                onValueChange={(val) => field.onChange([val])}
                                defaultValue={field.value?.[0]}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm px-4">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Beginner / General">Beginner / General</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="University Level">University Level</SelectItem>
                                </SelectContent>
                            </Select>
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
