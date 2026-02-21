"use client"

import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "./schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle2, Globe, Laptop, MapPin, Tag, Users } from "lucide-react"

interface PreviewProps {
    form: UseFormReturn<CourseWizardData>
}

export function WizardPreview({ form }: PreviewProps) {
    const values = form.getValues()

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="space-y-12">
            {/* Prominent confirmation banner */}
            <div className="border-2 border-primary/30 bg-primary/5 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Konfirmasi & Tinjau</h2>
                        <p className="text-muted-foreground">Periksa kembali semua informasi kelas Anda di bawah ini. Klik <strong>&quot;Simpan &amp; Publikasikan&quot;</strong> di bagian bawah jika sudah benar.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <Card className="rounded-2xl border-none bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-primary" />
                            Target & Subjek
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Tingkat Pendidikan</p>
                            <div className="flex flex-wrap gap-2">
                                {values.levelEducationCourses.map(grade => (
                                    <Badge key={grade} variant="outline" className="bg-background">{grade}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Kategori & Sub-Kategori</p>
                            <p className="font-bold text-lg">{values.courseCategoryName || values.courseCategoryID || "-"}</p>
                            <div className="flex flex-wrap gap-2">
                                {(values.subCategoryNames?.length ? values.subCategoryNames : values.subCategoryIDs).map(sub => (
                                    <Badge key={sub} variant="secondary">{sub}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card className="rounded-2xl border-none bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Tag className="w-5 h-5 text-primary" />
                            Judul & Deskripsi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Judul Kelas</p>
                            <p className="font-bold leading-relaxed">{values.title || "-"}</p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Tentang Kelas</p>
                            <p className="text-sm line-clamp-3 text-muted-foreground">{values.description || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="rounded-2xl border-none bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Tag className="w-5 h-5 text-primary" />
                            Tarif & Paket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            {values.classType.includes("Online") && (
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        <Laptop className="w-4 h-4" /> ONLINE
                                    </div>
                                    <p className="text-xl font-black">{formatPrice(values.oneHourOnlinePrice || 0)} <span className="text-xs font-normal text-muted-foreground">/ Jam</span></p>
                                    <div className="flex flex-wrap gap-1">
                                        {values.onlineChannel.map(c => <Badge key={c} variant="outline" className="text-[10px] h-5">{c}</Badge>)}
                                    </div>
                                </div>
                            )}
                            {values.classType.includes("Offline") && (
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        <MapPin className="w-4 h-4" /> OFFLINE
                                    </div>
                                    <p className="text-xl font-black">{formatPrice(values.oneHourOfflinePrice || 0)} <span className="text-xs font-normal text-muted-foreground">/ Jam</span></p>
                                </div>
                            )}
                        </div>
                        {values.isFreeFirstCourse && (
                            <div className="p-3 bg-primary/10 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <p className="text-xs font-bold text-primary">Sesi Pertama Gratis Aktif</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="rounded-2xl border-none bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="w-5 h-5 text-primary" />
                            Jadwal Ketersediaan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                            <Globe className="w-4 h-4" /> Zona Waktu: {Object.values(values.courseSchedulesOnline || values.courseSchedulesOffline || {})[0]?.[0]?.timezone || "WIB"}
                        </div>
                        <div className="space-y-2">
                            {Object.entries(values.courseSchedulesOnline || {}).map(([day, slots]: [string, { startTime: string; timezone: string }[]]) => (
                                <div key={`online-${day}`} className="flex items-center justify-between text-sm">
                                    <span className="font-bold">{day} <span className="text-xs font-normal text-muted-foreground">(Online)</span></span>
                                    <div className="flex gap-1">
                                        {slots.map((s, i) => <Badge key={i} variant="secondary" className="text-[10px]">{s.startTime}</Badge>)}
                                    </div>
                                </div>
                            ))}
                            {Object.entries(values.courseSchedulesOffline || {}).map(([day, slots]: [string, { startTime: string; timezone: string }[]]) => (
                                <div key={`offline-${day}`} className="flex items-center justify-between text-sm">
                                    <span className="font-bold">{day} <span className="text-xs font-normal text-muted-foreground">(Offline)</span></span>
                                    <div className="flex gap-1">
                                        {slots.map((s, i) => <Badge key={i} variant="secondary" className="text-[10px]">{s.startTime}</Badge>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-8 bg-primary rounded-3xl text-primary-foreground space-y-4 shadow-xl shadow-primary/20">
                <h3 className="text-xl font-bold">Siap Memulai?</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                    Setelah mengklik tombol publikasikan, kelas Anda akan ditinjau oleh tim kami sebelum tampil di pencarian murid. Pastikan semua informasi sudah akurat.
                </p>
            </div>
        </div>
    )
}
