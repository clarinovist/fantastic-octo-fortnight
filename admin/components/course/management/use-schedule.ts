import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
    DaySchedule,
    FormData,
    TimeSlot,
    DAYS_OF_WEEK,
    INITIAL_DAYS,
} from "./form-schema";
import { CourseDetail } from "@/utils/types";

interface UseScheduleProps {
    form: UseFormReturn<FormData>;
    detail?: CourseDetail;
}

export function useSchedule({ form, detail }: UseScheduleProps) {
    // Helper function to create schedule from detail data
    const createScheduleFromDetail = (
        schedules: { [key: string]: { startTime: string; timezone: string }[] },
        type: "online" | "offline"
    ): DaySchedule[] => {
        if (!schedules || Object.keys(schedules).length === 0) {
            return INITIAL_DAYS.map((day) => ({
                day,
                timeSlots: [],
                isActive: false,
                isEditing: false,
                type,
            }));
        }

        return Object.entries(schedules).map(([dayKey, timeSlots]) => {
            // Convert day index to day name if it's a numeric key (from API)
            const dayName = isNaN(parseInt(dayKey))
                ? dayKey
                : DAYS_OF_WEEK[parseInt(dayKey) - 1] || dayKey;

            return {
                day: dayName,
                timeSlots: timeSlots.map((slot, index) => ({
                    id: `${dayName}-${index}-${Date.now()}`,
                    time: slot.startTime,
                })),
                isActive: timeSlots.length > 0,
                isEditing: false,
                type,
            };
        });
    };

    // Initialize schedules directly in useState with a function
    const [schedulesOnline, setSchedulesOnline] = useState<DaySchedule[]>(() =>
        createScheduleFromDetail(detail?.courseSchedulesOnline || {}, "online")
    );
    const [schedulesOffline, setSchedulesOffline] = useState<DaySchedule[]>(() =>
        createScheduleFromDetail(detail?.courseSchedulesOffline || {}, "offline")
    );
    const [selectedTimezone, setSelectedTimezone] = useState<string>(
        detail?.courseSchedulesOnline
            ? Object.values(detail.courseSchedulesOnline).flat()[0]?.timezone || "WIB"
            : detail?.courseSchedulesOffline
                ? Object.values(detail.courseSchedulesOffline).flat()[0]?.timezone ||
                "WIB"
                : "WIB"
    );
    const [newTimeHour, setNewTimeHour] = useState<string>("09");
    const [newTimeMinute, setNewTimeMinute] = useState<string>("00");

    // Update existing schedules when timezone changes
    useEffect(() => {
        if (!selectedTimezone) return;

        // Update all existing online schedules with new timezone
        const currentOnlineSchedules = form.getValues("courseSchedulesOnline");
        const updatedOnlineSchedules: typeof currentOnlineSchedules = {};

        Object.entries(currentOnlineSchedules).forEach(([day, timeSlots]) => {
            if (timeSlots && timeSlots.length > 0) {
                updatedOnlineSchedules[day] = timeSlots.map((slot) => ({
                    ...slot,
                    timezone: selectedTimezone,
                }));
            }
        });

        // Update all existing offline schedules with new timezone
        const currentOfflineSchedules = form.getValues("courseSchedulesOffline");
        const updatedOfflineSchedules: typeof currentOfflineSchedules = {};

        Object.entries(currentOfflineSchedules).forEach(([day, timeSlots]) => {
            if (timeSlots && timeSlots.length > 0) {
                updatedOfflineSchedules[day] = timeSlots.map((slot) => ({
                    ...slot,
                    timezone: selectedTimezone,
                }));
            }
        });

        // Update form values
        form.setValue("courseSchedulesOnline", updatedOnlineSchedules);
        form.setValue("courseSchedulesOffline", updatedOfflineSchedules);
    }, [selectedTimezone, form]);

    const toggleScheduleEdit = (dayIndex: number, type: "online" | "offline") => {
        if (type === "online") {
            setSchedulesOnline((prev) =>
                prev.map((schedule, index) =>
                    index === dayIndex
                        ? { ...schedule, isEditing: !schedule.isEditing }
                        : schedule
                )
            );
        } else {
            setSchedulesOffline((prev) =>
                prev.map((schedule, index) =>
                    index === dayIndex
                        ? { ...schedule, isEditing: !schedule.isEditing }
                        : schedule
                )
            );
        }
    };

    const addTimeSlot = (dayIndex: number, type: "online" | "offline") => {
        const newTime = `${newTimeHour}:${newTimeMinute}`;
        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            time: newTime,
        };

        if (type === "online") {
            const schedule = schedulesOnline[dayIndex];
            if (schedule) {
                // Update local state
                setSchedulesOnline((prev) =>
                    prev.map((sched, index) =>
                        index === dayIndex
                            ? {
                                ...sched,
                                timeSlots: [...sched.timeSlots, newSlot],
                                isActive: true,
                            }
                            : sched
                    )
                );

                // Update form data
                const currentSchedules = form.getValues("courseSchedulesOnline");
                const daySchedules = currentSchedules[schedule.day] || [];
                const updatedSchedules = [
                    ...daySchedules,
                    { startTime: newTime, timezone: selectedTimezone },
                ];
                form.setValue(
                    `courseSchedulesOnline.${schedule.day}`,
                    updatedSchedules
                );
            }
        } else {
            const schedule = schedulesOffline[dayIndex];
            if (schedule) {
                // Update local state
                setSchedulesOffline((prev) =>
                    prev.map((sched, index) =>
                        index === dayIndex
                            ? {
                                ...sched,
                                timeSlots: [...sched.timeSlots, newSlot],
                                isActive: true,
                            }
                            : sched
                    )
                );

                // Update form data
                const currentSchedules = form.getValues("courseSchedulesOffline");
                const daySchedules = currentSchedules[schedule.day] || [];
                const updatedSchedules = [
                    ...daySchedules,
                    { startTime: newTime, timezone: selectedTimezone },
                ];
                form.setValue(
                    `courseSchedulesOffline.${schedule.day}`,
                    updatedSchedules
                );
            }
        }
    };

    const removeTimeSlot = (
        dayIndex: number,
        slotId: string,
        type: "online" | "offline"
    ) => {
        if (type === "online") {
            const schedule = schedulesOnline[dayIndex];
            if (schedule) {
                const updatedTimeSlots = schedule.timeSlots.filter(
                    (slot) => slot.id !== slotId
                );

                // Update local state
                setSchedulesOnline((prev) =>
                    prev.map((sched, index) =>
                        index === dayIndex
                            ? {
                                ...sched,
                                timeSlots: updatedTimeSlots,
                                isActive: updatedTimeSlots.length > 0,
                            }
                            : sched
                    )
                );

                // Update form data - rebuild the schedule array without the removed slot
                const currentSchedules = form.getValues("courseSchedulesOnline");
                const daySchedules = currentSchedules[schedule.day] || [];

                // Find the slot index by matching time (since we don't store ID in form)
                const slotToRemove = schedule.timeSlots.find(
                    (slot) => slot.id === slotId
                );
                if (slotToRemove) {
                    const updatedDaySchedules = daySchedules.filter(
                        (formSlot) => formSlot.startTime !== slotToRemove.time
                    );

                    if (updatedDaySchedules.length > 0) {
                        form.setValue(
                            `courseSchedulesOnline.${schedule.day}`,
                            updatedDaySchedules
                        );
                    } else {
                        // Remove the entire day if no schedules left
                        const remainingSchedules = { ...currentSchedules };
                        delete remainingSchedules[schedule.day];
                        form.setValue("courseSchedulesOnline", remainingSchedules);
                    }
                }
            }
        } else {
            const schedule = schedulesOffline[dayIndex];
            if (schedule) {
                const updatedTimeSlots = schedule.timeSlots.filter(
                    (slot) => slot.id !== slotId
                );

                // Update local state
                setSchedulesOffline((prev) =>
                    prev.map((sched, index) =>
                        index === dayIndex
                            ? {
                                ...sched,
                                timeSlots: updatedTimeSlots,
                                isActive: updatedTimeSlots.length > 0,
                            }
                            : sched
                    )
                );

                // Update form data - rebuild the schedule array without the removed slot
                const currentSchedules = form.getValues("courseSchedulesOffline");
                const daySchedules = currentSchedules[schedule.day] || [];

                // Find the slot index by matching time (since we don't store ID in form)
                const slotToRemove = schedule.timeSlots.find(
                    (slot) => slot.id === slotId
                );
                if (slotToRemove) {
                    const updatedDaySchedules = daySchedules.filter(
                        (formSlot) => formSlot.startTime !== slotToRemove.time
                    );

                    if (updatedDaySchedules.length > 0) {
                        form.setValue(
                            `courseSchedulesOffline.${schedule.day}`,
                            updatedDaySchedules
                        );
                    } else {
                        // Remove the entire day if no schedules left
                        const remainingSchedules = { ...currentSchedules };
                        delete remainingSchedules[schedule.day];
                        form.setValue("courseSchedulesOffline", remainingSchedules);
                    }
                }
            }
        }
    };

    const removeSchedule = (dayIndex: number, type: "online" | "offline") => {
        if (type === "online") {
            const schedule = schedulesOnline[dayIndex];
            if (schedule) {
                // Remove from form data first
                const currentSchedules = form.getValues("courseSchedulesOnline");
                const remainingSchedules = { ...currentSchedules };
                delete remainingSchedules[schedule.day];
                form.setValue("courseSchedulesOnline", remainingSchedules);

                // Then remove from local state array
                setSchedulesOnline((prev) =>
                    prev.filter((_, index) => index !== dayIndex)
                );
            }
        } else {
            const schedule = schedulesOffline[dayIndex];
            if (schedule) {
                // Remove from form data first
                const currentSchedules = form.getValues("courseSchedulesOffline");
                const remainingSchedules = { ...currentSchedules };
                delete remainingSchedules[schedule.day];
                form.setValue("courseSchedulesOffline", remainingSchedules);

                // Then remove from local state array
                setSchedulesOffline((prev) =>
                    prev.filter((_, index) => index !== dayIndex)
                );
            }
        }
    };

    const addNewSchedule = (type: "online" | "offline") => {
        const availableDays = DAYS_OF_WEEK.filter((day) => {
            const schedules = type === "online" ? schedulesOnline : schedulesOffline;
            return !schedules.some((schedule) => schedule.day === day);
        });

        if (availableDays.length === 0) {
            // All days are already added
            return;
        }

        // Add the first available day (you could show a picker instead)
        const newSchedule: DaySchedule = {
            day: availableDays[0],
            timeSlots: [],
            isActive: false,
            isEditing: true,
            type,
        };

        if (type === "online") {
            setSchedulesOnline((prev) => [...prev, newSchedule]);
        } else {
            setSchedulesOffline((prev) => [...prev, newSchedule]);
        }
    };

    return {
        schedulesOnline,
        schedulesOffline,
        selectedTimezone,
        setSelectedTimezone,
        newTimeHour,
        setNewTimeHour,
        newTimeMinute,
        setNewTimeMinute,
        toggleScheduleEdit,
        addTimeSlot,
        removeTimeSlot,
        removeSchedule,
        addNewSchedule,
    };
}
