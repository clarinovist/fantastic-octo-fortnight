"use client"

import useSWR from "swr"
import { PageHeader } from "@/components/layout/page-header"
import { CourseCard } from "@/components/course/course-card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Layers } from "lucide-react"
import Link from "next/link"
import { getMyCourses } from "@/services/course"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesPage() {
    const { data: response, error, isLoading } = useSWR(
        "courses",
        () => getMyCourses(1, 100),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    )

    const courses = response?.data || []

    const actions = (
        <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/courses/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Kelas Baru
            </Link>
        </Button>
    )

    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Kelas Saya" }
    ]

    return (
        <div className="flex flex-col flex-1 overflow-auto">
            <PageHeader breadcrumbs={breadcrumbs} actions={actions} />

            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kelas Saya</h1>
                        <p className="text-muted-foreground">Kelola dan publikasikan kelas Anda di Lesprivate.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-xl" />
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-xl p-8 text-center">
                        <div className="bg-destructive/10 p-4 rounded-full mb-4">
                            <Search className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold">Gagal Memuat Data</h3>
                        <p className="text-muted-foreground mb-4">Terjadi kesalahan saat mengambil daftar kelas Anda.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Coba Lagi</Button>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl p-8 text-center bg-muted/20">
                        <div className="bg-primary/10 p-6 rounded-full mb-6">
                            <Layers className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Belum Ada Kelas</h3>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Mulai buat kelas pertama Anda untuk mulai mengajar murid di Lesprivate.
                        </p>
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                            <Link href="/courses/create">
                                <Plus className="mr-2 h-5 w-5" />
                                Buat Kelas Pertama Anda
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
