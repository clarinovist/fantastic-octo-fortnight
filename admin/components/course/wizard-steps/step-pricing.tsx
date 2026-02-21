"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyIdrInput } from "@/components/ui/currency-idr-input";

import { CourseWizardData } from "../course-wizard";
import { cn } from "@/lib/utils";
import { Video, Store, Layers, Plus, Trash2, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function StepPricing() {
    const { control, watch } = useFormContext<CourseWizardData>();
    const classTypes = watch("classType");

    // Helper to handle checkbox group for "classType" which is an array in schema but UI might be radio-like or multi-select
    // The design shows Radio cards: Online, Offline, Hybrid. 
    // "Hybrid" implies both.
    const handleClassTypeChange = (type: "Online" | "Offline" | "Hybrid", onChange: (value: string[]) => void) => {
        if (type === "Hybrid") onChange(["Online", "Offline"]);
        else onChange([type]);
    };

    const isOnline = classTypes.includes("Online");
    const isOffline = classTypes.includes("Offline");
    const isHybrid = isOnline && isOffline;

    // Field Arrays for Packages
    const { fields: onlinePackages, append: appendOnline, remove: removeOnline } = useFieldArray({
        control,
        name: "coursePrices.online"
    });

    const { fields: offlinePackages, append: appendOffline, remove: removeOffline } = useFieldArray({
        control,
        name: "coursePrices.offline"
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Tag className="size-5" />
                    </div>
                    Pricing & Plans
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm ml-10">Configure how this course is delivered and priced.</p>
            </div>

            <div className="grid gap-8 ml-1 md:ml-10">
                {/* Class Type Selection */}
                <FormField
                    control={control}
                    name="classType"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-base font-semibold">Class Type</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Online Option */}
                                <div
                                    onClick={() => handleClassTypeChange("Online", field.onChange)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all hover:border-primary relative group",
                                        !isHybrid && isOnline ? "border-primary ring-1 ring-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Video className={cn("size-5", !isHybrid && isOnline ? "text-primary" : "text-slate-400")} />
                                        <span className="font-semibold text-slate-900 dark:text-white">Online</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Remote via Zoom/Meet</p>
                                    {(!isHybrid && isOnline) && <div className="absolute top-4 right-4 text-primary"><div className="size-2 rounded-full bg-primary" /></div>}
                                </div>

                                {/* Offline Option */}
                                <div
                                    onClick={() => handleClassTypeChange("Offline", field.onChange)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all hover:border-primary relative group",
                                        !isHybrid && isOffline ? "border-primary ring-1 ring-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Store className={cn("size-5", !isHybrid && isOffline ? "text-primary" : "text-slate-400")} />
                                        <span className="font-semibold text-slate-900 dark:text-white">Offline</span>
                                    </div>
                                    <p className="text-xs text-slate-500">In-person at center</p>
                                    {(!isHybrid && isOffline) && <div className="absolute top-4 right-4 text-primary"><div className="size-2 rounded-full bg-primary" /></div>}
                                </div>

                                {/* Hybrid Option */}
                                <div
                                    onClick={() => handleClassTypeChange("Hybrid", field.onChange)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all hover:border-primary relative group",
                                        isHybrid ? "border-primary ring-1 ring-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Layers className={cn("size-5", isHybrid ? "text-primary" : "text-slate-400")} />
                                        <span className="font-semibold text-slate-900 dark:text-white">Hybrid</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Mix of both methods</p>
                                    {isHybrid && <div className="absolute top-4 right-4 text-primary"><div className="size-2 rounded-full bg-primary" /></div>}
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                {/* Online Packages */}
                {isOnline && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white">Online Packages</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                onClick={() => appendOnline({ durationInHour: 1, price: 0 })}
                            >
                                <Plus className="size-4 mr-1" /> Add Package
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase px-4">
                                <div className="col-span-6">Duration (Hours)</div>
                                <div className="col-span-5">Price</div>
                                <div className="col-span-1"></div>
                            </div>

                            {onlinePackages.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="col-span-6">
                                        <FormField
                                            control={control}
                                            name={`coursePrices.online.${index}.durationInHour`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={Number.isNaN(field.value) ? "" : field.value}
                                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                                className="pr-12"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">hrs</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <FormField
                                            control={control}
                                            name={`coursePrices.online.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <CurrencyIdrInput
                                                            value={field.value || 0}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button type="button" onClick={() => removeOnline(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Offline Packages */}
                {isOffline && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white">Offline Packages</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                onClick={() => appendOffline({ durationInHour: 1, price: 0 })}
                            >
                                <Plus className="size-4 mr-1" /> Add Package
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase px-4">
                                <div className="col-span-6">Duration (Hours)</div>
                                <div className="col-span-5">Price</div>
                                <div className="col-span-1"></div>
                            </div>

                            {offlinePackages.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="col-span-6">
                                        <FormField
                                            control={control}
                                            name={`coursePrices.offline.${index}.durationInHour`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={Number.isNaN(field.value) ? "" : field.value}
                                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                                className="pr-12"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">hrs</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <FormField
                                            control={control}
                                            name={`coursePrices.offline.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <CurrencyIdrInput
                                                            value={field.value || 0}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button type="button" onClick={() => removeOffline(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Promotions */}
                <FormField
                    control={control}
                    name="isFreeFirstCourse"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Free First Session
                                </FormLabel>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Offer the first session for free to attract more students.
                                </p>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
