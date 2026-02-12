"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { CourseWizardData } from "../schema"
import { CurrencyIdrInput } from "@/components/ui/currency-idr-input"
import { DURATION_OPTIONS, ONLINE_CHANNELS } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

interface StepProps {
    form: UseFormReturn<CourseWizardData>
}

export function StepHarga({ form }: StepProps) {
    const { fields: onlineFields, append: appendOnline, remove: removeOnline } = useFieldArray({
        control: form.control,
        name: "coursePrices.online",
    })

    const { fields: offlineFields, append: appendOffline, remove: removeOffline } = useFieldArray({
        control: form.control,
        name: "coursePrices.offline",
    })

    const classType = form.watch("classType")
    const oneHourOnlinePrice = form.watch("oneHourOnlinePrice")
    const oneHourOfflinePrice = form.watch("oneHourOfflinePrice")

    // Sync 1-hour price with the first item in packets
    useEffect(() => {
        if (classType.includes("Online")) {
            const idx = form.getValues("coursePrices.online").findIndex(p => p.durationInHour === 1)
            if (idx === -1) {
                appendOnline({ durationInHour: 1, price: oneHourOnlinePrice || 0 })
            } else {
                form.setValue(`coursePrices.online.${idx}.price`, oneHourOnlinePrice || 0)
            }
        }
    }, [oneHourOnlinePrice, classType, appendOnline, form])

    useEffect(() => {
        if (classType.includes("Offline")) {
            const idx = form.getValues("coursePrices.offline").findIndex(p => p.durationInHour === 1)
            if (idx === -1) {
                appendOffline({ durationInHour: 1, price: oneHourOfflinePrice || 0 })
            } else {
                form.setValue(`coursePrices.offline.${idx}.price`, oneHourOfflinePrice || 0)
            }
        }
    }, [oneHourOfflinePrice, classType, appendOffline, form])

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold mb-2">Tarif dan Paket</h2>
                <p className="text-muted-foreground">Tentukan tipe kelas, media pembelajaran, dan tarif mengajar Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Class Type & Channels */}
                <div className="space-y-8">
                    <FormField
                        control={form.control}
                        name="classType"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="text-base font-semibold">Tipe Kelas</FormLabel>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="type-online"
                                            checked={field.value?.includes("Online")}
                                            onCheckedChange={(checked) => {
                                                const newVal = checked
                                                    ? [...(field.value || []), "Online"]
                                                    : field.value?.filter(v => v !== "Online")
                                                field.onChange(newVal)
                                                if (!checked) form.setValue("onlineChannel", [])
                                            }}
                                            className="w-5 h-5"
                                        />
                                        <Label htmlFor="type-online" className="text-lg font-bold">ONLINE</Label>
                                    </div>

                                    {field.value?.includes("Online") && (
                                        <div className="ml-8 space-y-3 p-4 bg-muted/30 rounded-xl border border-dashed">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Media Pembelajaran</p>
                                            <FormField
                                                control={form.control}
                                                name="onlineChannel"
                                                render={({ field: channelField }) => (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {ONLINE_CHANNELS.map((channel) => (
                                                            <div key={channel} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`channel-${channel}`}
                                                                    checked={channelField.value?.includes(channel)}
                                                                    onCheckedChange={(checked) => {
                                                                        const newVal = checked
                                                                            ? [...(channelField.value || []), channel]
                                                                            : channelField.value?.filter(v => v !== channel)
                                                                        channelField.onChange(newVal)
                                                                    }}
                                                                />
                                                                <Label htmlFor={`channel-${channel}`} className="text-sm">{channel}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="type-offline"
                                            checked={field.value?.includes("Offline")}
                                            onCheckedChange={(checked) => {
                                                const newVal = checked
                                                    ? [...(field.value || []), "Offline"]
                                                    : field.value?.filter(v => v !== "Offline")
                                                field.onChange(newVal)
                                            }}
                                            className="w-5 h-5"
                                        />
                                        <Label htmlFor="type-offline" className="text-lg font-bold">OFFLINE</Label>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isFreeFirstCourse"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="w-5 h-5"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-semibold">Tawarkan Sesi Pertama Gratis</FormLabel>
                                    <p className="text-xs text-muted-foreground">Menarik lebih banyak calon murid untuk mencoba kelas Anda.</p>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Pricing Packages */}
                <div className="space-y-8">
                    {/* Online Pricing */}
                    {classType.includes("Online") && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-primary">TARIF ONLINE</h3>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Wajib diisi</span>
                            </div>

                            <FormField
                                control={form.control}
                                name="oneHourOnlinePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Tarif Dasar (1 Jam)</FormLabel>
                                        <FormControl>
                                            <CurrencyIdrInput
                                                value={field.value || 0}
                                                onChange={field.onChange}
                                                className="text-xl font-bold h-14 rounded-xl border-primary bg-primary/5"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-4">
                                <p className="text-sm font-bold text-muted-foreground">PAKET TAMBAHAN (OPSIONAL)</p>
                                {onlineFields.filter(f => f.durationInHour !== 1).map((field) => {
                                    // Find real index in the full array for form methods
                                    const realIndex = form.getValues("coursePrices.online").findIndex(p => p.durationInHour === field.durationInHour && p.price === field.price)
                                    if (realIndex === -1) return null;

                                    return (
                                        <div key={field.id} className="flex gap-3 items-end group">
                                            <FormField
                                                control={form.control}
                                                name={`coursePrices.online.${realIndex}.durationInHour`}
                                                render={({ field: dField }) => (
                                                    <FormItem className="w-24">
                                                        <FormControl>
                                                            <Select value={dField.value?.toString()} onValueChange={v => dField.onChange(parseFloat(v))}>
                                                                <SelectTrigger className="rounded-xl h-12">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {DURATION_OPTIONS.map(d => (
                                                                        <SelectItem key={d} value={d.toString()}>{d} Jam</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`coursePrices.online.${realIndex}.price`}
                                                render={({ field: pField }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <CurrencyIdrInput value={pField.value || 0} onChange={pField.onChange} className="rounded-xl h-12" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOnline(realIndex)} className="h-12 w-12 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendOnline({ durationInHour: 2, price: 0 })}
                                    className="w-full border-dashed rounded-xl h-12 hover:bg-muted/50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Paket Online
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Offline Pricing */}
                    {classType.includes("Offline") && (
                        <div className="space-y-6 pt-8 border-t border-dashed">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-primary">TARIF OFFLINE</h3>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Wajib diisi</span>
                            </div>

                            <FormField
                                control={form.control}
                                name="oneHourOfflinePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Tarif Dasar (1 Jam)</FormLabel>
                                        <FormControl>
                                            <CurrencyIdrInput
                                                value={field.value || 0}
                                                onChange={field.onChange}
                                                className="text-xl font-bold h-14 rounded-xl border-primary bg-primary/5"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-4">
                                <p className="text-sm font-bold text-muted-foreground">PAKET TAMBAHAN (OPSIONAL)</p>
                                {offlineFields.filter(f => f.durationInHour !== 1).map((field) => {
                                    const realIndex = form.getValues("coursePrices.offline").findIndex(p => p.durationInHour === field.durationInHour && p.price === field.price)
                                    if (realIndex === -1) return null;

                                    return (
                                        <div key={field.id} className="flex gap-3 items-end group">
                                            <FormField
                                                control={form.control}
                                                name={`coursePrices.offline.${realIndex}.durationInHour`}
                                                render={({ field: dField }) => (
                                                    <FormItem className="w-24">
                                                        <FormControl>
                                                            <Select value={dField.value?.toString()} onValueChange={v => dField.onChange(parseFloat(v))}>
                                                                <SelectTrigger className="rounded-xl h-12">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {DURATION_OPTIONS.map(d => (
                                                                        <SelectItem key={d} value={d.toString()}>{d} Jam</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`coursePrices.offline.${realIndex}.price`}
                                                render={({ field: pField }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <CurrencyIdrInput value={pField.value || 0} onChange={pField.onChange} className="rounded-xl h-12" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOffline(realIndex)} className="h-12 w-12 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendOffline({ durationInHour: 2, price: 0 })}
                                    className="w-full border-dashed rounded-xl h-12 hover:bg-muted/50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Paket Offline
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
