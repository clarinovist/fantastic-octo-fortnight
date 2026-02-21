"use client";

import { useFormContext } from "react-hook-form";
import { CourseWizardData } from "../course-wizard";
import { CheckCircle, Info, Tag, Calendar, Users } from "lucide-react";

import { Tutor, CourseCategory } from "@/utils/types";

interface StepReviewProps {
    categories: CourseCategory[];
    tutors: Tutor[];
}

export function StepReview({ categories, tutors }: StepReviewProps) {
    const { watch } = useFormContext<CourseWizardData>();
    const values = watch();

    const isOnline = values.classType.includes("Online");
    const isOffline = values.classType.includes("Offline");

    // Lookup names
    const categoryName = categories.find(c => c.id === values.courseCategoryID)?.name || values.courseCategoryID;
    const tutorName = tutors.find(t => t.id === values.tutorId)?.name || values.tutorId;

    // Basic formatting helper
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle className="size-5" />
                    </div>
                    Review & Publish
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm ml-10">Review all details before publishing your course.</p>
            </div>

            <div className="grid gap-6 ml-1 md:ml-10">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                            <Info className="size-4 text-primary" />
                            Basic Information
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Title</p>
                            <p className="font-medium text-slate-900 dark:text-white text-lg">{values.title || "Untitled Course"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Description</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{values.description ? <span dangerouslySetInnerHTML={{ __html: values.description }} /> : "No description provided."}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Category</p>
                                <p className="text-sm font-medium">{categoryName || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tutor</p>
                                <div className="flex items-center gap-2">
                                    <Users className="size-3 text-slate-400" />
                                    <span className="text-sm font-medium">{tutorName || "Unassigned"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                            <Tag className="size-4 text-primary" />
                            Pricing Strategy
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Class Type</p>
                            <div className="flex gap-2">
                                {values.classType.map(type => (
                                    <span key={type} className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {isOnline && values.coursePrices.online.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Online Packages</p>
                                <div className="space-y-1">
                                    {values.coursePrices.online.map((pkg, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span>{pkg.durationInHour} Hours</span>
                                            <span className="font-mono font-medium">{formatMoney(pkg.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isOffline && values.coursePrices.offline?.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Offline Packages</p>
                                <div className="space-y-1">
                                    {values.coursePrices.offline.map((pkg, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span>{pkg.durationInHour} Hours</span>
                                            <span className="font-mono font-medium">{formatMoney(pkg.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule & Visibility */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                        <Calendar className="size-4 text-primary" />
                        Schedule Summary
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {isOnline && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Online Sessions</p>
                                <div className="space-y-2">
                                    {Object.entries(values.courseSchedulesOnline || {}).map(([day, slots]) => (
                                        (slots && slots.length > 0) && (
                                            <div key={day} className="flex gap-2 text-sm">
                                                <span className="w-20 font-medium text-slate-700 dark:text-slate-300">{day}</span>
                                                <div className="flex flex-col">
                                                    {slots.map((slot, i) => <span key={i} className="text-slate-500">{slot.startTime} {slot.timezone}</span>)}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                    {Object.values(values.courseSchedulesOnline || {}).every(s => !s || s.length === 0) && <span className="text-sm text-slate-400 italic">No schedules set</span>}
                                </div>
                            </div>
                        )}

                        {isOffline && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Offline Sessions</p>
                                <div className="space-y-2">
                                    {Object.entries(values.courseSchedulesOffline || {}).map(([day, slots]) => (
                                        (slots && slots.length > 0) && (
                                            <div key={day} className="flex gap-2 text-sm">
                                                <span className="w-20 font-medium text-slate-700 dark:text-slate-300">{day}</span>
                                                <div className="flex flex-col">
                                                    {slots.map((slot, i) => <span key={i} className="text-slate-500">{slot.startTime} {slot.timezone}</span>)}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                    {Object.values(values.courseSchedulesOffline || {}).every(s => !s || s.length === 0) && <span className="text-sm text-slate-400 italic">No schedules set</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
