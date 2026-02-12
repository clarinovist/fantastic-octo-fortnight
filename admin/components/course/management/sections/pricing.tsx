"use client";

import { UseFormReturn, useFieldArray, ControllerRenderProps } from "react-hook-form";
import { FormData, ONLINE_CHANNELS, DURATION_OPTIONS } from "../form-schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CurrencyIdrInput } from "@/components/ui/currency-idr-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const RemoveIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
    >
        <path
            d="M1.2 12L0 10.8L4.8 6L0 1.2L1.2 0L6 4.8L10.8 0L12 1.2L7.2 6L12 10.8L10.8 12L6 7.2L1.2 12Z"
            fill="black"
            fillOpacity="0.25"
        />
    </svg>
);

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

interface PricingSectionProps {
    form: UseFormReturn<FormData>;
}

export function PricingSection({ form }: PricingSectionProps) {
    const classType = form.watch("classType");
    const oneHourOnlinePrice = form.watch("oneHourOnlinePrice");
    const oneHourOfflinePrice = form.watch("oneHourOfflinePrice");

    // Field arrays for managing dynamic pricing packages
    const {
        fields: onlineFields,
        append: appendOnline,
        remove: removeOnline,
    } = useFieldArray({
        control: form.control,
        name: "coursePrices.online",
    });

    const {
        fields: offlineFields,
        append: appendOffline,
        remove: removeOffline,
    } = useFieldArray({
        control: form.control,
        name: "coursePrices.offline",
    });

    // Sync 1-hour prices with the first package entry
    useEffect(() => {
        const currentOnlinePrices = form.getValues("coursePrices.online");
        const currentOfflinePrices = form.getValues("coursePrices.offline");

        // Update online 1-hour package
        if (
            currentOnlinePrices.length > 0 &&
            currentOnlinePrices[0].durationInHour === 1
        ) {
            form.setValue(`coursePrices.online.0.price`, oneHourOnlinePrice || 0);
        }

        // Update offline 1-hour package
        if (
            currentOfflinePrices.length > 0 &&
            currentOfflinePrices[0].durationInHour === 1
        ) {
            form.setValue(`coursePrices.offline.0.price`, oneHourOfflinePrice || 0);
        }
    }, [oneHourOnlinePrice, oneHourOfflinePrice, form]);

    const renderOnlineChannelCheckbox = (
        channel: string,
        field: ControllerRenderProps<FormData, "onlineChannel">
    ) => (
        <div key={channel} className="flex items-center space-x-2">
            <Checkbox
                id={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
                checked={field.value?.includes(channel)}
                disabled={!classType.includes("Online")}
                onCheckedChange={(checked) => {
                    if (checked) {
                        field.onChange([...(field.value || []), channel]);
                    } else {
                        field.onChange(field.value?.filter((c: string) => c !== channel));
                    }
                }}
            />
            <Label
                htmlFor={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-sm select-none"
            >
                {channel}
            </Label>
        </div>
    );

    return (
        <div className="relative">
            <section>
                <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                    <div className="space-y-6 md:min-w-[560px] min-w-full">
                        <h3 className="text-2xl mb-4 font-bold">
                            Tentang Course dan Tutor
                        </h3>
                        <div className="flex md:flex-row flex-col gap-6">
                            <div className="pr-6 border-r-0 md:border-r">
                                <p className="font-bold mb-3">Tipe Course</p>
                                <FormField
                                    control={form.control}
                                    name="classType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <Checkbox
                                                        id="online"
                                                        checked={field.value?.includes("Online")}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...(field.value || []),
                                                                    "Online",
                                                                ]);
                                                            } else {
                                                                const newVal = field.value?.filter(
                                                                    (g: string) => g !== "Online"
                                                                );
                                                                field.onChange(newVal);
                                                                // reset onlineChannel if "Online" is unchecked
                                                                form.setValue("onlineChannel", []);
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor="online"
                                                        className="text-lg font-bold select-none"
                                                    >
                                                        ONLINE
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="ml-8 mb-4">
                                    <FormField
                                        control={form.control}
                                        name="onlineChannel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="flex flex-col gap-4">
                                                        {ONLINE_CHANNELS.map((channel) =>
                                                            renderOnlineChannelCheckbox(channel, field)
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="classType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <Checkbox
                                                        id="Offline"
                                                        checked={field.value?.includes("Offline")}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...(field.value || []),
                                                                    "Offline",
                                                                ]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value?.filter(
                                                                        (g: string) => g !== "Offline"
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor="Offline"
                                                        className="text-lg font-bold select-none"
                                                    >
                                                        OFFLINE
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <p className="font-bold">Tarif Course</p>
                                    {/* 1-hour pricing input */}
                                    <FormField
                                        control={form.control}
                                        name="oneHourOnlinePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold">
                                                    ONLINE
                                                </FormLabel>
                                                <FormControl>
                                                    <CurrencyIdrInput
                                                        value={field.value || 0}
                                                        onChange={field.onChange}
                                                        placeholder="Rp XXXXX"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Package pricing */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold mb-4">
                                            Package
                                        </h4>
                                        <div className="space-y-3">
                                            {onlineFields
                                                .filter(
                                                    (field) =>
                                                        form.getValues(
                                                            `coursePrices.online.${onlineFields.indexOf(
                                                                field
                                                            )}.durationInHour`
                                                        ) !== 1
                                                )
                                                .map((field) => {
                                                    const index = onlineFields.indexOf(field);
                                                    return (
                                                        <div
                                                            key={field.id}
                                                            className="flex gap-4 items-end"
                                                        >
                                                            <FormField
                                                                control={form.control}
                                                                name={`coursePrices.online.${index}.durationInHour`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs font-bold">
                                                                            DURASI
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Select
                                                                                value={
                                                                                    field.value?.toString() || ""
                                                                                }
                                                                                onValueChange={(val) =>
                                                                                    field.onChange(parseInt(val))
                                                                                }
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Pilih durasi" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {DURATION_OPTIONS.map(
                                                                                        (duration) => (
                                                                                            <SelectItem
                                                                                                key={duration}
                                                                                                value={duration.toString()}
                                                                                            >
                                                                                                {duration} jam
                                                                                            </SelectItem>
                                                                                        )
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`coursePrices.online.${index}.price`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormLabel className="text-xs font-bold">
                                                                            TARIF
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <CurrencyIdrInput
                                                                                value={field.value || 0}
                                                                                onChange={field.onChange}
                                                                                placeholder="Rp XXXXX"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    removeOnline(index);
                                                                }}
                                                            >
                                                                <RemoveIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    appendOnline({ durationInHour: 2, price: 0 });
                                                }}
                                                className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <p className="invisible font-bold">Tarif Course</p>
                                    {/* 1-hour pricing input */}
                                    <FormField
                                        control={form.control}
                                        name="oneHourOfflinePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold">
                                                    OFFLINE
                                                </FormLabel>
                                                <FormControl>
                                                    <CurrencyIdrInput
                                                        value={field.value || 0}
                                                        onChange={field.onChange}
                                                        placeholder="Rp XXXXX"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Package pricing */}
                                    <div className="space-y-4">
                                        <h4 className="invisible text-lg font-semibold mb-4">
                                            Package
                                        </h4>
                                        <div className="space-y-3">
                                            {offlineFields
                                                .filter(
                                                    (field) =>
                                                        form.getValues(
                                                            `coursePrices.offline.${offlineFields.indexOf(
                                                                field
                                                            )}.durationInHour`
                                                        ) !== 1
                                                )
                                                .map((field) => {
                                                    const index = offlineFields.indexOf(field);
                                                    return (
                                                        <div
                                                            key={field.id}
                                                            className="flex items-end gap-4"
                                                        >
                                                            <FormField
                                                                control={form.control}
                                                                name={`coursePrices.offline.${index}.durationInHour`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs font-bold">
                                                                            DURASI
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Select
                                                                                value={
                                                                                    field.value?.toString() || ""
                                                                                }
                                                                                onValueChange={(val) =>
                                                                                    field.onChange(parseInt(val))
                                                                                }
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Pilih durasi" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {DURATION_OPTIONS.map(
                                                                                        (duration) => (
                                                                                            <SelectItem
                                                                                                key={duration}
                                                                                                value={duration.toString()}
                                                                                            >
                                                                                                {duration} jam
                                                                                            </SelectItem>
                                                                                        )
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`coursePrices.offline.${index}.price`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormLabel className="text-xs font-bold">
                                                                            TARIF
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <CurrencyIdrInput
                                                                                value={field.value || 0}
                                                                                onChange={field.onChange}
                                                                                placeholder="0"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    removeOffline(index);
                                                                }}
                                                            >
                                                                <RemoveIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    appendOffline({ durationInHour: 2, price: 0 });
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
                        <div className="mt-24 flex justify-center">
                            <FormField
                                control={form.control}
                                name="isFreeFirstCourse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="isFreeFirstCourse"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label
                                                    htmlFor="isFreeFirstCourse"
                                                    className="tex-xs"
                                                >
                                                    Aktifkan label{" "}
                                                    <span className="font-bold">
                                                        Sesi Pertama Gratis
                                                    </span>
                                                </Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
