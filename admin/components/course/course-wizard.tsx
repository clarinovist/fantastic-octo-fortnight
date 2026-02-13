"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { createCourseAction, updateCourseAction } from "@/actions/course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, ArrowLeft, Loader2, Trash2, FileText, CreditCard, CalendarDays, CheckCircle } from "lucide-react";

// Import Step Components (to be created)
// Import Step Components
import { StepBasicInfo } from "@/components/course/wizard-steps/step-basic-info";
import { StepPricing } from "@/components/course/wizard-steps/step-pricing";
import { StepSchedule } from "@/components/course/wizard-steps/step-schedule";
import { StepReview } from "@/components/course/wizard-steps/step-review";
import type { Tutor, CourseCategory, CourseDetail, CourseSchedule, CoursePayload } from "@/utils/types";


export const courseWizardSchema = z.object({
    // Step 1: Basic Info
    title: z.string().min(1, "Course title is required"),
    description: z.string().default(""),
    courseCategoryID: z.string().min(1, "Category is required"),
    subCategoryIDs: z.array(z.string()).default([]),
    levelEducationCourses: z.array(z.string()).default([]),
    tutorId: z.string().default(""),

    // Step 2: Pricing
    classType: z.array(z.string()).min(1, "Select at least one class type"),
    coursePrices: z.object({
        offline: z.array(z.object({
            durationInHour: z.number().min(0),
            price: z.number().min(0),
        })).default([]),
        online: z.array(z.object({
            durationInHour: z.number().min(0),
            price: z.number().min(0),
        })).default([]),
    }),
    isFreeFirstCourse: z.boolean().default(false),
    onlineChannel: z.array(z.string()).default([]),

    // Step 3: Schedule
    courseSchedulesOffline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string(),
    }))).default({}),
    courseSchedulesOnline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string(),
    }))).default({}),
});

export type CourseWizardData = z.infer<typeof courseWizardSchema>;

const DAYS_OF_WEEK = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
];

const transformDetailToFormData = (detail: CourseDetail): Partial<CourseWizardData> => {
    // Helper function to transform schedules from API format to form format
    const transformSchedules = (schedules: {
        [key: string]: { startTime: string; timezone: string }[];
    }) => {
        const transformed: Record<string, { startTime: string; timezone: string }[]> = {};

        Object.entries(schedules).forEach(([dayIndex, timeSlots]) => {
            // Convert day index to day name (assuming 1-7 maps to DAYS_OF_WEEK)
            const dayName = DAYS_OF_WEEK[parseInt(dayIndex) - 1];
            if (dayName && timeSlots && timeSlots.length > 0) {
                transformed[dayName] = timeSlots.map((slot) => ({
                    startTime: slot.startTime,
                    timezone: slot.timezone,
                }));
            }
        });

        return transformed;
    };

    return {
        classType:
            detail.tutor.classType === "all"
                ? ["Online", "Offline"]
                : detail.tutor.classType === "online"
                    ? ["Online"]
                    : detail.tutor.classType === "offline"
                        ? ["Offline"]
                        : [],
        courseCategoryID: detail.courseCategory.id,
        coursePrices: {
            offline: detail.coursePrices.offline?.map((price) => ({
                durationInHour: price.durationInHour,
                price: parseInt(price.price.replace(/[^\d]/g, "")) || 0,
            })) || [{ durationInHour: 1, price: 0 }],
            online: detail.coursePrices.online?.map((price) => ({
                durationInHour: price.durationInHour,
                price: parseInt(price.price.replace(/[^\d]/g, "")) || 0,
            })) || [{ durationInHour: 1, price: 0 }],
        },
        courseSchedulesOffline: transformSchedules(
            detail.courseSchedulesOffline || {}
        ),
        courseSchedulesOnline: transformSchedules(
            detail.courseSchedulesOnline || {}
        ),
        description: detail.description,
        isFreeFirstCourse: detail.isFreeFirstCourse,
        levelEducationCourses: Array.isArray(detail.levelEducationCourse)
            ? [...detail.levelEducationCourse]
            : [],
        onlineChannel:
            detail.onlineChannel?.filter(Boolean) || [],
        title: detail.title,
        subCategoryIDs:
            detail.subCourseCategories?.map((subCat) => subCat.id) || [],
        tutorId: detail.tutor.id,
    };
};

interface CourseWizardProps {
    tutors: Tutor[];
    categories: CourseCategory[];
    initialData?: CourseDetail;
    isEditMode?: boolean;
}

const STEPS = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Pricing", icon: CreditCard },
    { id: 3, title: "Schedule", icon: CalendarDays },
    { id: 4, title: "Review", icon: CheckCircle },
];

type ScheduleSlot = { startTime: string; timezone: string };

export function CourseWizard({ tutors, categories, initialData, isEditMode = false }: CourseWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseWizardData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(courseWizardSchema) as any,
        defaultValues: initialData ? transformDetailToFormData(initialData) : {
            title: "",
            description: "",
            courseCategoryID: "",
            subCategoryIDs: [],
            levelEducationCourses: [],
            tutorId: "",
            classType: ["Online"], // Default
            coursePrices: {
                offline: [{ durationInHour: 1, price: 0 }],
                online: [{ durationInHour: 1, price: 0 }],
            },
            isFreeFirstCourse: true,
            onlineChannel: [],
            courseSchedulesOffline: {},
            courseSchedulesOnline: {},
        },
        mode: "onChange",
    });

    const getDayIndex = (day: string) => {
        const days: Record<string, string> = {
            "Senin": "1",
            "Selasa": "2",
            "Rabu": "3",
            "Kamis": "4",
            "Jumat": "5",
            "Sabtu": "6",
            "Minggu": "7"
        };
        return days[day] || "1";
    };


    const nextStep = async () => {
        // Validate current step fields before moving
        let isValid = false;
        if (currentStep === 1) {
            isValid = await form.trigger(["title", "courseCategoryID"]);
        } else if (currentStep === 2) {
            isValid = await form.trigger(["classType"]); // Add other fields as needed
        } else if (currentStep === 3) {
            isValid = true; // Schedule validation is complex, assume valid for now or add specific checks
        } else {
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: CourseWizardData) => {
        setIsSubmitting(true);
        try {
            // Determine classType
            let classType: "online" | "offline" | "all";
            if (data.classType.includes("Online") && data.classType.includes("Offline")) {
                classType = "all";
            } else if (data.classType.includes("Online")) {
                classType = "online";
            } else {
                classType = "offline";
            }

            // Transform schedules helper for payload
            const transformSchedulesForPayload = (
                schedules: Record<string, ScheduleSlot[]> | undefined,
                classType: "online" | "offline" | "all"
            ): CourseSchedule => {
                if (!schedules) return {};
                const transformed: CourseSchedule = {};
                Object.entries(schedules).forEach(([dayName, timeSlots]) => {
                    const validTimeSlots = timeSlots.filter(slot => slot.startTime && slot.startTime.trim() !== "");
                    if (validTimeSlots.length > 0) {
                        const dayIndex = getDayIndex(dayName);
                        transformed[dayIndex] = validTimeSlots.map(slot => ({
                            startTime: slot.startTime.includes(":") && slot.startTime.split(":").length === 2 ? `${slot.startTime}:00` : slot.startTime,
                            timezone: slot.timezone,
                            classType: classType,
                        }));
                    }
                });
                return transformed;
            };

            // Prepare payload for API
            const payload = {
                title: data.title,
                description: data.description || "",
                courseCategoryID: data.courseCategoryID,
                subCategoryIDs: data.subCategoryIDs,
                levelEducationCourses: data.levelEducationCourses,
                tutorId: data.tutorId,
                classType,
                isFreeFirstCourse: data.isFreeFirstCourse,
                onlineChannel: data.onlineChannel,
                coursePrices: {
                    offline: data.coursePrices.offline.map(p => ({
                        durationInHour: p.durationInHour,
                        price: p.price
                    })),
                    online: data.coursePrices.online.map(p => ({
                        durationInHour: p.durationInHour,
                        price: p.price
                    }))
                },
                courseSchedulesOffline: transformSchedulesForPayload(data.courseSchedulesOffline, classType),
                courseSchedulesOnline: transformSchedulesForPayload(data.courseSchedulesOnline, classType),
                tutorDescription: initialData?.tutor.description || "",
            };

            if (!payload.tutorId) {
                toast.error("Please assign a tutor before publishing");
                setIsSubmitting(false);
                return;
            }

            if (isEditMode && initialData) {
                const updatePayload = {
                    ...payload,
                    coursePrices: {
                        offline: payload.coursePrices.offline.map(p => ({ ...p, price: String(p.price) })),
                        online: payload.coursePrices.online.map(p => ({ ...p, price: String(p.price) })),
                    }
                };
                const result = await updateCourseAction(initialData.id, updatePayload as unknown as CoursePayload);
                if (!result.success) {
                    toast.error(result.error || "Failed to update course");
                } else {
                    toast.success("Course updated successfully!");
                    // Refresh current page to show updated data
                    router.refresh();
                    router.push(`/courses/${initialData.id}`);
                }
            } else {
                const result = await createCourseAction(payload);
                if (!result.success) {
                    toast.error(result.error || "Failed to create course");
                } else {
                    toast.success("Course created successfully!");
                    router.push("/courses");
                }
            }
        } catch (error) {
            toast.error("Failed to create course");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 px-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#131118] dark:text-white tracking-tight mb-1">{isEditMode ? "Edit Course" : "Create New Course"}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{isEditMode ? "Update course details and configuration." : "Fill in the details below to configure your new course offering."}</p>
                </div>
                <button
                    type="button"
                    onClick={() => router.push("/courses")}
                    className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <Trash2 className="size-5" />
                    <span>Discard Draft</span>
                </button>
            </div>

            {/* Wizard Stepper */}
            <div className="mb-10 mt-4">
                <div className="relative flex items-center justify-between w-full">
                    {/* Background Track Line */}
                    <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                    {/* Active Progress Line */}
                    <div
                        className="absolute left-0 top-5 h-0.5 bg-primary z-0 transition-all duration-700 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id}
                                onClick={() => isCompleted && setCurrentStep(step.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 group transition-all duration-300 cursor-pointer",
                                    !isActive && !isCompleted && "opacity-60 grayscale"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full transition-all ring-4 ring-white dark:ring-[#171121] z-10 shadow-sm",
                                    isActive || isCompleted
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                )}>
                                    {isCompleted ? (
                                        <Check className="size-5 animate-in zoom-in-0 duration-300" />
                                    ) : (
                                        <step.icon className="size-5" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm transition-colors",
                                    isActive || isCompleted ? "text-primary font-bold" : "text-gray-500 dark:text-gray-400 font-medium"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Content */}
            <FormProvider {...form}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="w-full">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                        <div className="flex-1 p-6 lg:p-10">
                            {currentStep === 1 && <StepBasicInfo categories={categories} tutors={tutors} />}
                            {currentStep === 2 && <StepPricing />}
                            {currentStep === 3 && <StepSchedule />}
                            {currentStep === 4 && <StepReview />}
                        </div>

                        {/* Footer Navigation */}
                        <div className="bg-gray-50 dark:bg-[#171121] px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 font-medium transition-colors"
                            >
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 font-bold transition-all transform active:scale-95"
                                >
                                    Next Step
                                    <ArrowRight className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 font-bold transition-all transform active:scale-95"
                                >
                                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                    {isEditMode ? "Update Course" : "Publish Course"}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
