"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ChevronRight,
    Users,
    School,
    Edit3,
    Calendar as CalendarIcon,
    Clock,
    ChevronDown,
    Eye,
    Lock,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { getStudents } from "@/services/student";
import { getTutors, getCoursesByTutor } from "@/services/tutor";
import type { Student, Tutor, TutorCourse } from "@/utils/types";

const bookingSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    tutorId: z.string().min(1, "Tutor is required"),
    courseId: z.string().min(1, "Course / Subject is required"),
    bookingDate: z.string().min(1, "Date is required"),
    bookingTime: z.string().min(1, "Start time is required"),
    classType: z.enum(["online", "offline"]),
    timezone: z.string().min(1, "Timezone is required"),
    status: z.enum(["pending", "accepted", "declined", "expired"]),
    notesTutor: z.string().optional(),
    notesStudent: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
    initialData?: Partial<BookingFormValues> & { duration?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: (data: BookingFormValues & { duration: string }) => Promise<{ success: boolean; error?: string; data?: any }>;
}

export function BookingForm({ initialData, action }: BookingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTutorId, setSelectedTutorId] = useState<string | null>(initialData?.tutorId || null);
    const [courses, setCourses] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [students, setStudents] = useState<{ label: string; value: string }[]>([]);
    const [tutors, setTutors] = useState<{ label: string; value: string }[]>([]);
    const [duration, setDuration] = useState(initialData?.duration || "1 hr");

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            studentId: initialData?.studentId || "",
            tutorId: initialData?.tutorId || "",
            courseId: (initialData as any)?.courseId || "",
            bookingDate: initialData?.bookingDate || new Date().toISOString().split("T")[0],
            bookingTime: initialData?.bookingTime || "14:00",
            classType: (initialData as any)?.classType || "online",
            timezone: (initialData as any)?.timezone || "Asia/Jakarta",
            status: (initialData?.status as BookingFormValues["status"]) || "pending",
            notesTutor: initialData?.notesTutor || "",
            notesStudent: initialData?.notesStudent || "",
        },
    });

    const tutorIdWatcher = form.watch("tutorId");

    useEffect(() => {
        const loadInitialData = async () => {
            const [sRes, tRes] = await Promise.all([
                getStudents({ pageSize: 100 }),
                getTutors({ pageSize: 100 })
            ]);
            setStudents((sRes.data || []).map((s: Student) => ({ label: s.name, value: s.id })));
            setTutors((tRes.data || []).map((t: Tutor) => ({ label: t.name, value: t.id })));
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (tutorIdWatcher && tutorIdWatcher !== selectedTutorId) {
            setSelectedTutorId(tutorIdWatcher);
            fetchCourses(tutorIdWatcher);
        }
    }, [tutorIdWatcher, selectedTutorId]);

    const fetchCourses = async (tutorId: string) => {
        try {
            setIsLoadingCourses(true);
            const res = await getCoursesByTutor(tutorId);
            if (res.data) {
                setCourses(res.data.map((c: TutorCourse) => ({ label: c.title, value: c.id })));
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    async function onSubmit(values: BookingFormValues) {
        try {
            setIsSubmitting(true);
            const res = await action({ ...values, duration });
            if (res.success) {
                toast.success("Booking saved successfully");
                router.push("/bookings");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to save booking");
            }
        } catch {
            toast.error("An error occurred while fetching courses");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Header / Breadcrumbs */}
            <header className="flex flex-col gap-1 px-4">
                <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    <Link href="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Dashboard</Link>
                    <ChevronRight className="size-4 mx-2" />
                    <Link href="/bookings" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Bookings</Link>
                    <ChevronRight className="size-4 mx-2" />
                    <span className="text-[#7c3bed] font-semibold">New Booking</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Booking Management</h1>
            </header>

            <Form {...form}>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20 px-4">
                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#1e1729] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit3 className="size-5 text-[#7c3bed]" />
                                Create New Booking
                            </h2>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Draft</span>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Section 1: Participants */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <span className="size-6 rounded-full bg-[#7c3bed]/10 flex items-center justify-center text-[#7c3bed] text-[10px] font-bold">1</span>
                                    Participants
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student Selector */}
                                    <FormField
                                        control={form.control}
                                        name="studentId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="student" className="text-sm font-medium text-slate-700 dark:text-slate-300">Student</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Users className="size-4 text-slate-400" />
                                                    </div>
                                                    <select
                                                        {...field}
                                                        id="student"
                                                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] appearance-none dark:text-white transition-all transition-all"
                                                    >
                                                        <option value="" disabled>Search student name...</option>
                                                        {students.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tutor Selector */}
                                    <FormField
                                        control={form.control}
                                        name="tutorId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="tutor" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tutor</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <School className="size-4 text-slate-400" />
                                                    </div>
                                                    <select
                                                        {...field}
                                                        id="tutor"
                                                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] appearance-none dark:text-white transition-all transition-all"
                                                    >
                                                        <option value="" disabled>Search tutor name...</option>
                                                        {tutors.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Section 2: Session Details */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <span className="size-6 rounded-full bg-[#7c3bed]/10 flex items-center justify-center text-[#7c3bed] text-[10px] font-bold">2</span>
                                    Session Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Course Selection */}
                                    <FormField
                                        control={form.control}
                                        name="courseId"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1.5">
                                                <FormLabel htmlFor="course" className="text-sm font-medium text-slate-700 dark:text-slate-300">Course / Subject</FormLabel>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        id="course"
                                                        disabled={!selectedTutorId || isLoadingCourses}
                                                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] appearance-none dark:text-white transition-all transition-all"
                                                    >
                                                        <option value="" disabled>{isLoadingCourses ? "Loading courses..." : "Select a course..."}</option>
                                                        {courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Class Type */}
                                    <FormField
                                        control={form.control}
                                        name="classType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Class Type</FormLabel>
                                                <div className="flex gap-2">
                                                    {["online", "offline"].map((val) => (
                                                        <label key={val} className="flex-1 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                className="peer sr-only"
                                                                name="classType"
                                                                value={val}
                                                                checked={field.value === val}
                                                                onChange={() => field.onChange(val)}
                                                            />
                                                            <div className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#252b3b] text-sm font-medium text-slate-600 dark:text-slate-400 peer-checked:bg-[#7c3bed]/10 peer-checked:border-[#7c3bed] peer-checked:text-[#7c3bed] transition-all capitalize">
                                                                {val}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Timezone */}
                                    <FormField
                                        control={form.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="timezone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</FormLabel>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        id="timezone"
                                                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] appearance-none dark:text-white transition-all"
                                                    >
                                                        <option value="Asia/Jakarta">Jakarta (GMT+7)</option>
                                                        <option value="Asia/Makassar">Makassar (GMT+8)</option>
                                                        <option value="Asia/Jayapura">Jayapura (GMT+9)</option>
                                                        <option value="UTC">UTC</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Date Picker */}
                                    <FormField
                                        control={form.control}
                                        name="bookingDate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="date" className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <CalendarIcon className="size-4 text-slate-400" />
                                                    </div>
                                                    <input
                                                        {...field}
                                                        id="date"
                                                        type="date"
                                                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] dark:text-white transition-all"
                                                    />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Time Picker */}
                                    <FormField
                                        control={form.control}
                                        name="bookingTime"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="time" className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Clock className="size-4 text-slate-400" />
                                                    </div>
                                                    <input
                                                        {...field}
                                                        id="time"
                                                        type="time"
                                                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] dark:text-white transition-all"
                                                    />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Duration */}
                                    <div className="space-y-1.5">
                                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration</FormLabel>
                                        <div className="flex gap-2">
                                            {["1 hr", "1.5 hrs", "2 hrs"].map((val) => (
                                                <label key={val} className="flex-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        className="peer sr-only"
                                                        name="duration"
                                                        value={val}
                                                        checked={duration === val}
                                                        onChange={(e) => setDuration(e.target.value)}
                                                    />
                                                    <div className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#252b3b] text-sm font-medium text-slate-600 dark:text-slate-400 peer-checked:bg-[#7c3bed]/10 peer-checked:border-[#7c3bed] peer-checked:text-[#7c3bed] transition-all">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">Booking Status</FormLabel>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        id="status"
                                                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] appearance-none dark:text-white transition-all"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="accepted">Confirmed</option>
                                                        <option value="declined">Declined</option>
                                                        <option value="expired">Expired</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                                                        <span className={`size-2.5 rounded-full mr-2 ${field.value === 'pending' ? 'bg-yellow-400' : field.value === 'accepted' ? 'bg-blue-600' : field.value === 'declined' ? 'bg-red-600' : 'bg-slate-400'}`}></span>
                                                    </div>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Section 3: Notes */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <span className="size-6 rounded-full bg-[#7c3bed]/10 flex items-center justify-center text-[#7c3bed] text-[10px] font-bold">3</span>
                                    Additional Notes
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="notesStudent"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <FormLabel htmlFor="notesStudent" className="text-sm font-medium text-slate-700 dark:text-slate-300">Student Notes</FormLabel>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Eye className="size-3.5" />
                                                        Visible to Student
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <textarea
                                                        {...field}
                                                        id="notesStudent"
                                                        placeholder="Add notes for the student about preparation..."
                                                        rows={4}
                                                        className="block w-full p-3 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] dark:text-white transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notesTutor"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <FormLabel htmlFor="notesTutor" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tutor Notes</FormLabel>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Lock className="size-3.5" />
                                                        Private / Internal
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <textarea
                                                        {...field}
                                                        id="notesTutor"
                                                        placeholder="Internal notes for the tutor or admin only."
                                                        rows={4}
                                                        className="block w-full p-3 bg-slate-50 dark:bg-[#252b3b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm focus:outline-none focus:border-[#7c3bed] focus:ring-1 focus:ring-[#7c3bed] dark:text-white transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Actions Footer */}
                            <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#7c3bed] hover:bg-[#5b21b6] shadow-md shadow-[#7c3bed]/20 hover:shadow-lg transition-all focus:ring-4 focus:ring-[#7c3bed]/20 flex items-center justify-center gap-2 rounded-xl"
                                >
                                    {isSubmitting ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle className="size-5" />
                                    )}
                                    Save Booking
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 dark:text-slate-500">
                        <p>© 2026 Lesprivate Admin Console. All rights reserved.</p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
