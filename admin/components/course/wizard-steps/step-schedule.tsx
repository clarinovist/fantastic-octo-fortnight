"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { CourseWizardData } from "../course-wizard";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";


const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function StepSchedule() {
    const { control, watch, setValue, getValues } = useFormContext<CourseWizardData>();
    const classTypes = watch("classType");
    const isOnline = classTypes.includes("Online");
    const isOffline = classTypes.includes("Offline");

    // Helper to add a time slot
    const addTimeSlot = (day: string, type: "online" | "offline") => {
        const fieldName = type === "online" ? "courseSchedulesOnline" : "courseSchedulesOffline";
        const currentSchedules = getValues(fieldName);
        const daySchedules = currentSchedules[day] || [];

        setValue(fieldName, {
            ...currentSchedules,
            [day]: [...daySchedules, { startTime: "09:00", timezone: "WIB" }]
        });
    };

    // Helper to remove a time slot
    const removeTimeSlot = (day: string, index: number, type: "online" | "offline") => {
        const fieldName = type === "online" ? "courseSchedulesOnline" : "courseSchedulesOffline";
        const currentSchedules = getValues(fieldName);
        const daySchedules = currentSchedules[day] || [];

        setValue(fieldName, {
            ...currentSchedules,
            [day]: daySchedules.filter((_, i) => i !== index)
        });
    };

    // Helper to update a time slot
    const updateTimeSlot = (day: string, index: number, field: "startTime" | "timezone", value: string, type: "online" | "offline") => {
        const fieldName = type === "online" ? "courseSchedulesOnline" : "courseSchedulesOffline";
        const currentSchedules = getValues(fieldName);
        const daySchedules = currentSchedules[day] || [];

        const newDaySchedules = [...daySchedules];
        newDaySchedules[index] = { ...newDaySchedules[index], [field]: value };

        setValue(fieldName, {
            ...currentSchedules,
            [day]: newDaySchedules
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="size-5" />
                    </div>
                    Schedule & Availability
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm ml-10">Set the weekly schedule for your classes.</p>
            </div>

            <div className="grid gap-8 ml-1 md:ml-10">
                {isOnline && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500" />
                            Online Schedule
                        </h3>
                        <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                            {DAYS.map(day => (
                                <FormField
                                    key={`online-${day}`}
                                    control={control}
                                    name={`courseSchedulesOnline.${day}`}
                                    render={({ field }) => {
                                        const slots = field.value || [];
                                        const isActive = slots.length > 0;

                                        return (
                                            <div className={cn("flex flex-col md:flex-row gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0", !isActive && "opacity-60 hover:opacity-100 transition-opacity")}>
                                                <div className="w-32 pt-2 flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isActive}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) addTimeSlot(day, "online");
                                                            else field.onChange([]);
                                                        }}
                                                    />
                                                    <span className={cn("font-medium", isActive ? "text-slate-900 dark:text-white" : "text-slate-500")}>{day}</span>
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    {slots.map((slot, index) => (
                                                        <div key={index} className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-2">
                                                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                <Clock className="size-4 text-slate-400" />
                                                                <input
                                                                    type="time"
                                                                    value={slot.startTime}
                                                                    onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value, "online")}
                                                                    className="bg-transparent border-none text-sm p-0 focus:ring-0 text-slate-700 dark:text-slate-300 cursor-pointer w-24"
                                                                />
                                                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                                                                <select
                                                                    value={slot.timezone}
                                                                    onChange={(e) => updateTimeSlot(day, index, "timezone", e.target.value, "online")}
                                                                    className="bg-transparent border-none text-sm p-0 focus:ring-0 text-slate-500 cursor-pointer text-xs"
                                                                >
                                                                    <option value="WIB">WIB</option>
                                                                    <option value="WITA">WITA</option>
                                                                    <option value="WIT">WIT</option>
                                                                </select>
                                                            </div>
                                                            <button type="button" onClick={() => removeTimeSlot(day, index, "online")} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {isActive && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => addTimeSlot(day, "online")}
                                                            className="text-primary hover:text-primary/80 h-8 px-2"
                                                        >
                                                            <Plus className="size-3 mr-1" /> Add time slot
                                                        </Button>
                                                    )}

                                                    {!isActive && (
                                                        <span className="text-sm text-slate-400 italic pt-2 block">Unavailable</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {isOffline && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="size-2 rounded-full bg-blue-500" />
                            Offline Schedule
                        </h3>
                        <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                            {DAYS.map(day => (
                                <FormField
                                    key={`offline-${day}`}
                                    control={control}
                                    name={`courseSchedulesOffline.${day}`}
                                    render={({ field }) => {
                                        const slots = field.value || [];
                                        const isActive = slots.length > 0;

                                        return (
                                            <div className={cn("flex flex-col md:flex-row gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0", !isActive && "opacity-60 hover:opacity-100 transition-opacity")}>
                                                <div className="w-32 pt-2 flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isActive}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) addTimeSlot(day, "offline");
                                                            else field.onChange([]);
                                                        }}
                                                    />
                                                    <span className={cn("font-medium", isActive ? "text-slate-900 dark:text-white" : "text-slate-500")}>{day}</span>
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    {slots.map((slot, index) => (
                                                        <div key={index} className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-2">
                                                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                <Clock className="size-4 text-slate-400" />
                                                                <input
                                                                    type="time"
                                                                    value={slot.startTime}
                                                                    onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value, "offline")}
                                                                    className="bg-transparent border-none text-sm p-0 focus:ring-0 text-slate-700 dark:text-slate-300 cursor-pointer w-24"
                                                                />
                                                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                                                                <select
                                                                    value={slot.timezone}
                                                                    onChange={(e) => updateTimeSlot(day, index, "timezone", e.target.value, "offline")}
                                                                    className="bg-transparent border-none text-sm p-0 focus:ring-0 text-slate-500 cursor-pointer text-xs"
                                                                >
                                                                    <option value="WIB">WIB</option>
                                                                    <option value="WITA">WITA</option>
                                                                    <option value="WIT">WIT</option>
                                                                </select>
                                                            </div>
                                                            <button type="button" onClick={() => removeTimeSlot(day, index, "offline")} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {isActive && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => addTimeSlot(day, "offline")}
                                                            className="text-primary hover:text-primary/80 h-8 px-2"
                                                        >
                                                            <Plus className="size-3 mr-1" /> Add time slot
                                                        </Button>
                                                    )}

                                                    {!isActive && (
                                                        <span className="text-sm text-slate-400 italic pt-2 block">Unavailable</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
