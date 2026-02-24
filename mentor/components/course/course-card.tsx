"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { CourseSaved } from "@/utils/types/course"
import { COURSE_STATUS } from "@/utils/constants"
import { publishCourseAction, deleteCourseAction, submitCourseAction } from "@/actions/course"
import { toast } from "sonner"
import { mutate } from "swr"

interface CourseCardProps {
    course: CourseSaved
}

export function CourseCard({ course }: CourseCardProps) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePublishToggle = async (checked: boolean) => {
        if (checked && course.status?.toLowerCase() !== COURSE_STATUS.ACCEPTED) {
            toast.error("Hanya kelas yang disetujui yang dapat dipublikasikan")
            return
        }

        startTransition(async () => {
            const res = await publishCourseAction(course.id, checked)
            if (res.success) {
                toast.success(`Kelas berhasil ${checked ? "dipublish" : "diunpublish"}`)
                mutate("courses")
            } else {
                toast.error("Gagal mengubah status publikasi")
            }
        })
    }

    const handleSubmitForReview = async () => {
        setIsSubmitting(true)
        const res = await submitCourseAction(course.id)
        if (res.success) {
            toast.success("Kelas berhasil diajukan untuk review admin")
            mutate("courses")
        } else {
            toast.error("Gagal mengajukan kelas: " + (res.error || "Unknown error"))
        }
        setIsSubmitting(false)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const res = await deleteCourseAction(course.id)
        if (res.success) {
            toast.success("Kelas berhasil dihapus")
            mutate("courses")
        } else {
            toast.error("Gagal menghapus kelas")
        }
        setIsDeleting(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case COURSE_STATUS.ACCEPTED:
                return <Badge className="bg-green-500 hover:bg-green-600">Diterima</Badge>
            case COURSE_STATUS.REJECTED:
                return <Badge variant="destructive">Ditolak</Badge>
            case COURSE_STATUS.WAITING_FOR_APPROVAL:
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Menunggu</Badge>
            case COURSE_STATUS.DRAFT:
            default:
                return <Badge variant="secondary">Draft</Badge>
        }
    }

    return (
        <Card className="overflow-hidden border-border transition-all hover:shadow-md">
            <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {getStatusBadge(course.status)}
                        {course.isPublished && (
                            <Badge variant="outline" className="text-primary border-primary">Live</Badge>
                        )}
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1 mt-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.courseCategory?.name || "Kategori tidak dikonfigurasi"}</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {course.description || "Tidak ada deskripsi"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                    {(() => {
                        // Find the best price to display: first look for 1-hour rates, then any non-zero price
                        let displayPrice = 0;

                        // Check top-level price field
                        if (course.price && !isNaN(parseInt(course.price)) && parseInt(course.price) > 0) {
                            displayPrice = parseInt(course.price);
                        }

                        // If no top-level price, search coursePrices for 1-hour rate first
                        if (displayPrice === 0) {
                            const oneHourOnline = course.coursePrices?.online?.find(p => p.durationInHour === 1);
                            const oneHourOffline = course.coursePrices?.offline?.find(p => p.durationInHour === 1);
                            if (oneHourOnline?.price && parseInt(oneHourOnline.price) > 0) {
                                displayPrice = parseInt(oneHourOnline.price);
                            } else if (oneHourOffline?.price && parseInt(oneHourOffline.price) > 0) {
                                displayPrice = parseInt(oneHourOffline.price);
                            }
                        }

                        // Fallback: any non-zero price in the arrays
                        if (displayPrice === 0) {
                            const anyOnline = course.coursePrices?.online?.find(p => parseInt(p.price) > 0);
                            const anyOffline = course.coursePrices?.offline?.find(p => parseInt(p.price) > 0);
                            if (anyOnline) displayPrice = parseInt(anyOnline.price);
                            else if (anyOffline) displayPrice = parseInt(anyOffline.price);
                        }

                        if (displayPrice > 0) {
                            return (
                                <span className="text-sm font-medium">
                                    Rp {displayPrice.toLocaleString('id-ID')} / jam
                                    {course.isFreeFirstCourse && (
                                        <span className="ml-2 text-xs text-primary font-bold">• Sesi 1 Gratis</span>
                                    )}
                                </span>
                            )
                        }
                        return <span className="text-sm text-muted-foreground italic">Harga belum diatur</span>
                    })()}
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/30 flex items-center justify-between border-t">
                <div className="flex items-center gap-2">
                    <Switch
                        id={`publish-${course.id}`}
                        checked={course.isPublished}
                        onCheckedChange={handlePublishToggle}
                        disabled={isPending}
                    />
                    <label htmlFor={`publish-${course.id}`} className="text-xs font-medium cursor-pointer">
                        {course.isPublished ? "Published" : "Unpublished"}
                    </label>
                </div>
                <div className="flex items-center gap-1">
                    {(course.status?.toLowerCase() === COURSE_STATUS.DRAFT || course.status?.toLowerCase() === COURSE_STATUS.REJECTED) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSubmitForReview}
                            disabled={isSubmitting || isPending}
                            title="Ajukan untuk Review Admin"
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/courses/edit/${course.id}`}>
                            <Pencil className="w-4 h-4" />
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Kelas <strong>{course.title}</strong> akan dihapus permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardFooter>
        </Card>
    )
}
