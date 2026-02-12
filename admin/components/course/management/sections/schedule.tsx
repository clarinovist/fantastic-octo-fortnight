"use client";

import { UseFormReturn } from "react-hook-form";
import { FormData, TIMEZONE } from "../form-schema";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Plus, SquarePen, Trash2 } from "lucide-react";

const PlusIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <g clipPath="url(#clip0_1216_30362)">
            <path
                d="M16 9.14286H9.14286V16H6.85714V9.14286H0V6.85714H6.85714V0H9.14286V6.85714H16V9.14286Z"
                fill="white"
            />
        </g>
        <defs>
            <clipPath id="clip0_1216_30362">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

interface ScheduleSectionProps {
    form: UseFormReturn<FormData>;
    schedulesOnline: Array<{
        day: string;
        timeSlots: Array<{ id: string; time: string }>;
        isActive: boolean;
        isEditing: boolean;
        type: "online" | "offline";
    }>;
    schedulesOffline: Array<{
        day: string;
        timeSlots: Array<{ id: string; time: string }>;
        isActive: boolean;
        isEditing: boolean;
        type: "online" | "offline";
    }>;
    selectedTimezone: string;
    setSelectedTimezone: (value: string) => void;
    newTimeHour: string;
    setNewTimeHour: (value: string) => void;
    newTimeMinute: string;
    setNewTimeMinute: (value: string) => void;
    toggleScheduleEdit: (dayIndex: number, type: "online" | "offline") => void;
    addTimeSlot: (dayIndex: number, type: "online" | "offline") => void;
    removeTimeSlot: (dayIndex: number, slotId: string, type: "online" | "offline") => void;
    removeSchedule: (dayIndex: number, type: "online" | "offline") => void;
    addNewSchedule: (type: "online" | "offline") => void;
}

export function ScheduleSection({
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
}: ScheduleSectionProps) {
    return (
        <div className="relative">
            <section>
                <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                    <div className="space-y-6 md:min-w-[560px] min-w-full">
                        <h3 className="text-2xl mb-4 font-bold">
                            Availability Schedule
                        </h3>
                        <div className="flex md:flex-row flex-col gap-6">
                            <div className="pr-6">
                                <p className="font-bold mb-3">Zona Waktu</p>
                                <RadioGroup
                                    value={selectedTimezone}
                                    onValueChange={setSelectedTimezone}
                                    className="flex flex-col gap-4"
                                >
                                    {TIMEZONE.map((time) => (
                                        <div
                                            key={time}
                                            className="flex items-center space-x-2"
                                        >
                                            <RadioGroupItem
                                                value={time}
                                                id={`timezone-${time
                                                    .replace(/\s+/g, "-")
                                                    .toLowerCase()}`}
                                            />
                                            <Label
                                                htmlFor={`timezone-${time
                                                    .replace(/\s+/g, "-")
                                                    .toLowerCase()}`}
                                                className="text-sm select-none cursor-pointer"
                                            >
                                                {time}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="border-r-0 md:border-r max-h-[300px]" />
                            <div className="pr-6">
                                <p className="font-bold mb-3">Online</p>
                                <div className="flex-1 space-y-4">
                                    {schedulesOnline.map((schedule, index) => (
                                        <Card
                                            key={schedule.day}
                                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${schedule.isEditing
                                                ? "border hover:border-black"
                                                : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-3">
                                                    <h3 className="text-lg font-bold">
                                                        {schedule.day}
                                                    </h3>
                                                    {schedule.isEditing ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={newTimeHour}
                                                                    onValueChange={setNewTimeHour}
                                                                >
                                                                    <SelectTrigger className="w-24 border">
                                                                        <SelectValue placeholder="00" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from(
                                                                            { length: 24 },
                                                                            (_, i) => (
                                                                                <SelectItem
                                                                                    key={i}
                                                                                    value={i
                                                                                        .toString()
                                                                                        .padStart(2, "0")}
                                                                                >
                                                                                    {i.toString().padStart(2, "0")}
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="font-medium">:</span>
                                                                <Select
                                                                    value={newTimeMinute}
                                                                    onValueChange={setNewTimeMinute}
                                                                >
                                                                    <SelectTrigger className="w-24">
                                                                        <SelectValue placeholder="00" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="00">00</SelectItem>
                                                                        <SelectItem value="15">15</SelectItem>
                                                                        <SelectItem value="30">30</SelectItem>
                                                                        <SelectItem value="45">45</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addTimeSlot(index, "online");
                                                                    }}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {schedule.timeSlots.map((slot) => (
                                                                    <div
                                                                        key={slot.id}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            className="relative group bg-black hover:bg-black text-white px-6 py-2 rounded-xl font-medium"
                                                                        >
                                                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                                                                {slot.time}
                                                                            </span>
                                                                            <span
                                                                                onClick={() =>
                                                                                    removeTimeSlot(
                                                                                        index,
                                                                                        slot.id,
                                                                                        "online"
                                                                                    )
                                                                                }
                                                                                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="16"
                                                                                    viewBox="0 0 16 16"
                                                                                    fill="none"
                                                                                    aria-hidden
                                                                                >
                                                                                    <path
                                                                                        d="M4 4L12 12"
                                                                                        stroke="white"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                    <path
                                                                                        d="M12 4L4 12"
                                                                                        stroke="white"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 flex-wrap">
                                                            {schedule.timeSlots.length === 0 ? (
                                                                <p className="text-gray-500 italic">
                                                                    No time slots added
                                                                </p>
                                                            ) : (
                                                                schedule.timeSlots.map((slot) => (
                                                                    <Button
                                                                        key={slot.id}
                                                                        type="button"
                                                                        variant="secondary"
                                                                        className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                                                    >
                                                                        {slot.time}
                                                                    </Button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    {!schedule.isEditing ? (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    toggleScheduleEdit(index, "online");
                                                                }}
                                                            >
                                                                <SquarePen className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-400 hover:text-red-500"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    removeSchedule(index, "online");
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="lg"
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleScheduleEdit(index, "online");
                                                            }}
                                                        >
                                                            <Check className="w-12 h-12" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addNewSchedule("online");
                                        }}
                                        className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="border-r-0 md:border-r max-h-[300px]" />
                            <div className="pr-6">
                                <p className="font-bold mb-3">Offline</p>
                                <div className="flex-1 space-y-4">
                                    {schedulesOffline.map((schedule, index) => (
                                        <Card
                                            key={schedule.day}
                                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${schedule.isEditing
                                                ? "border-black hover:border-black"
                                                : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-3">
                                                    <h3 className="text-lg font-bold">
                                                        {schedule.day}
                                                    </h3>
                                                    {schedule.isEditing ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={newTimeHour}
                                                                    onValueChange={setNewTimeHour}
                                                                >
                                                                    <SelectTrigger className="w-24">
                                                                        <SelectValue placeholder="00" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from(
                                                                            { length: 24 },
                                                                            (_, i) => (
                                                                                <SelectItem
                                                                                    key={i}
                                                                                    value={i
                                                                                        .toString()
                                                                                        .padStart(2, "0")}
                                                                                >
                                                                                    {i.toString().padStart(2, "0")}
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="font-medium">:</span>
                                                                <Select
                                                                    value={newTimeMinute}
                                                                    onValueChange={setNewTimeMinute}
                                                                >
                                                                    <SelectTrigger className="w-24 border">
                                                                        <SelectValue placeholder="00" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="00">00</SelectItem>
                                                                        <SelectItem value="15">15</SelectItem>
                                                                        <SelectItem value="30">30</SelectItem>
                                                                        <SelectItem value="45">45</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        addTimeSlot(index, "offline");
                                                                    }}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {schedule.timeSlots.map((slot) => (
                                                                    <div
                                                                        key={slot.id}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            className="relative group bg-black hover:bg-black text-white px-6 py-2 rounded-xl font-medium"
                                                                        >
                                                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                                                                {slot.time}
                                                                            </span>
                                                                            <span
                                                                                onClick={() =>
                                                                                    removeTimeSlot(
                                                                                        index,
                                                                                        slot.id,
                                                                                        "offline"
                                                                                    )
                                                                                }
                                                                                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="16"
                                                                                    viewBox="0 0 16 16"
                                                                                    fill="none"
                                                                                    aria-hidden
                                                                                >
                                                                                    <path
                                                                                        d="M4 4L12 12"
                                                                                        stroke="white"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                    <path
                                                                                        d="M12 4L4 12"
                                                                                        stroke="white"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 flex-wrap">
                                                            {schedule.timeSlots.length === 0 ? (
                                                                <p className="text-gray-500 italic">
                                                                    No time slots added
                                                                </p>
                                                            ) : (
                                                                schedule.timeSlots.map((slot) => (
                                                                    <Button
                                                                        key={slot.id}
                                                                        type="button"
                                                                        variant="secondary"
                                                                        className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                                                    >
                                                                        {slot.time}
                                                                    </Button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    {!schedule.isEditing ? (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    toggleScheduleEdit(index, "offline");
                                                                }}
                                                            >
                                                                <SquarePen className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-400 hover:text-red-500"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    removeSchedule(index, "offline");
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="lg"
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleScheduleEdit(index, "offline");
                                                            }}
                                                        >
                                                            <Check className="w-12 h-12" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addNewSchedule("offline");
                                        }}
                                        className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
