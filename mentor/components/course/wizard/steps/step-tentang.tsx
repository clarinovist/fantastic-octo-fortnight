"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "../schema"

interface StepProps {
    form: UseFormReturn<CourseWizardData>
}

export function StepTentang({ form }: StepProps) {
    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold mb-2">Tentang Kelas dan Tutor</h2>
                <p className="text-muted-foreground">Deskripsikan kelas Anda semenarik mungkin untuk menarik minat murid.</p>
            </div>

            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <div className="flex justify-between">
                            <FormLabel className="text-base font-semibold">Judul Kelas</FormLabel>
                            <span className="text-xs text-muted-foreground">{field.value?.length || 0}/150</span>
                        </div>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Contoh: Matematika Dasar untuk Persiapan UN SD"
                                className="min-h-[100px] resize-none text-lg font-medium leading-relaxed rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                                maxLength={150}
                            />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Gunakan judul yang jelas dan menggambarkan isi kelas.</p>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <div className="flex justify-between">
                            <FormLabel className="text-base font-semibold">Deskripsi Kelas</FormLabel>
                            <span className="text-xs text-muted-foreground">{field.value?.length || 0}/1000</span>
                        </div>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Jelaskan apa yang akan dipelajari, manfaat, dan topik utama..."
                                className="min-h-[250px] resize-none leading-relaxed rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                                maxLength={1000}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="tutorDescription"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <div className="flex justify-between">
                            <FormLabel className="text-base font-semibold">Tentang Tutor (Anda)</FormLabel>
                            <span className="text-xs text-muted-foreground">{field.value?.length || 0}/1000</span>
                        </div>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Ceritakan pengalaman mengajar, keahlian, dan metode mengajar Anda..."
                                className="min-h-[250px] resize-none leading-relaxed rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary"
                                maxLength={1000}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
