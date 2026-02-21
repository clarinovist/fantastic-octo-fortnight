"use client"

import { DAYS_OF_WEEK, TIMEZONE } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "../schema"

interface StepProps {
    form: UseFormReturn<CourseWizardData>
}

interface ScheduleSlot {
    startTime: string;
    timezone: string;
}

export function StepJadwal({ form }: StepProps) {
    const [selectedTimezone, setSelectedTimezone] = useState("WIB")
    const [activeTab, setActiveTab] = useState<"Online" | "Offline">("Online")
    const classType = form.watch("classType")

    const onlineSchedules = form.watch("courseSchedulesOnline") || {}
    const offlineSchedules = form.watch("courseSchedulesOffline") || {}



    useEffect(() => {
        if (classType && classType.length > 0 && !classType.includes(activeTab)) {
            setActiveTab(classType[0] as "Online" | "Offline")
        }
    }, [classType, activeTab])

    const addTimeSlot = (day: string, type: "Online" | "Offline", hour: string, minute: string) => {
        const fieldName = type === "Online" ? "courseSchedulesOnline" : "courseSchedulesOffline"
        const current = form.getValues(fieldName) || {}
        const daySlots = current[day] || []

        const newSlot = { startTime: `${hour}:${minute}`, timezone: selectedTimezone }
        form.setValue(`${fieldName}.${day}`, [...daySlots, newSlot])
    }

    const removeTimeSlot = (day: string, type: "Online" | "Offline", index: number) => {
        const fieldName = type === "Online" ? "courseSchedulesOnline" : "courseSchedulesOffline"
        const current = form.getValues(fieldName) || {}
        const daySlots = [...(current[day] || [])]
        daySlots.splice(index, 1)

        if (daySlots.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [day]: _, ...rest } = current
            form.setValue(fieldName, rest)
        } else {
            form.setValue(`${fieldName}.${day}`, daySlots)
        }
    }

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold mb-2">Jadwal Ketersediaan</h2>
                <p className="text-muted-foreground">Atur waktu rutin Anda untuk mengajar setiap minggunya.</p>
            </div>

            <div className="space-y-8">
                {/* Timezone Selection */}
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                        <Globe className="w-4 h-4" />
                        Zona Waktu
                    </div>
                    <RadioGroup
                        value={selectedTimezone}
                        onValueChange={setSelectedTimezone}
                        className="flex flex-wrap gap-6"
                    >
                        {TIMEZONE.map((tz) => (
                            <div key={tz} className="flex items-center space-x-2">
                                <RadioGroupItem value={tz} id={`tz-${tz}`} />
                                <Label htmlFor={`tz-${tz}`} className="font-medium cursor-pointer">{tz}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* Mode Tabs */}
                {classType && classType.length > 1 && (
                    <div className="flex p-1 bg-muted rounded-xl w-fit">
                        {classType.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setActiveTab(type as "Online" | "Offline")}
                                className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === type
                                    ? "bg-background shadow-sm text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* Weekly Scheduler */}
                <div className="grid grid-cols-1 gap-6">
                    {DAYS_OF_WEEK.map((day) => {
                        const slots = activeTab === "Online" ? onlineSchedules[day] || [] : offlineSchedules[day] || []
                        return (
                            <DayCard
                                key={day}
                                day={day}
                                slots={slots}
                                selectedTimezone={selectedTimezone}
                                onAdd={(h, m) => addTimeSlot(day, activeTab, h, m)}
                                onRemove={(idx) => removeTimeSlot(day, activeTab, idx)}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function DayCard({ day, slots, selectedTimezone, onAdd, onRemove }: {
    day: string,
    slots: ScheduleSlot[],
    selectedTimezone: string,
    onAdd: (h: string, m: string) => void,
    onRemove: (idx: number) => void
}) {
    const [h, setH] = useState("09")
    const [m, setM] = useState("00")

    return (
        <Card className={`overflow-hidden transition-all border-l-4 ${slots.length > 0 ? "border-l-primary" : "border-l-muted opacity-80"}`}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="md:w-32">
                    <h3 className="text-lg font-bold">{day}</h3>
                    <p className="text-xs text-muted-foreground uppercase">{slots.length} Sesi Aktif</p>
                </div>

                <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {slots.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase opacity-50">
                            <Globe className="w-4 h-4" /> {selectedTimezone}
                        </div>
                    ) : (
                        slots.map((slot, idx) => (
                            <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                <span className="font-mono font-bold tracking-tight">{slot.startTime}</span>
                                <span className="text-[10px] opacity-70">{slot.timezone}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(idx)}
                                    className="p-1 hover:bg-destructive hover:text-white rounded-full transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))
                    )}
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl border border-dashed ml-auto">
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Jam</span>
                        <Select value={h} onValueChange={setH}>
                            <SelectTrigger className="w-[70px] h-10 bg-background border font-bold">
                                <SelectValue placeholder="Jam" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                        {i.toString().padStart(2, '0')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="font-bold text-xl pt-5">:</span>
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Menit</span>
                        <Select value={m} onValueChange={setM}>
                            <SelectTrigger className="w-[70px] h-10 bg-background border font-bold">
                                <SelectValue placeholder="Menit" />
                            </SelectTrigger>
                            <SelectContent>
                                {["00", "15", "30", "45"].map((val) => (
                                    <SelectItem key={val} value={val}>{val}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col justify-end pt-5">
                        <Button
                            type="button"
                            size="sm"
                            className="w-10 h-10 rounded-lg shrink-0 bg-primary/10 hover:bg-primary/20 text-primary"
                            onClick={() => onAdd(h, m)}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
