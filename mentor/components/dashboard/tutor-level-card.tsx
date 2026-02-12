"use client"

import useSWR from "swr"
import { getTutorLevel } from "@/services/tutor-level"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function TutorLevelCard() {
    const { data: levelRes, isLoading } = useSWR("/v1/tutors/level", getTutorLevel)
    const levelInfo = levelRes?.data

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center p-6 h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                </CardContent>
            </Card>
        )
    }

    if (!levelInfo) return null

    const maxPoints = 25 // Milestone for Guru Favorit
    const progress = Math.min((levelInfo.current_point / maxPoints) * 100, 100)
    const isCompleted = levelInfo.current_point >= 25

    return (
        <Card className={cn(
            "h-full overflow-hidden transition-all relative border-none shadow-lg",
            isCompleted
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : "bg-gradient-to-br from-violet-600 to-indigo-700 text-white"
        )}>
            {/* Background Decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                        <Trophy className="h-4 w-4" />
                        Predikat Pengajar
                    </CardTitle>
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        Level {isCompleted ? "2" : "1"}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black tracking-tight uppercase italic underline decoration-white/30 underline-offset-4">
                            {levelInfo.current_level}
                        </h3>
                        <p className="text-xs opacity-80 font-medium">
                            {isCompleted
                                ? "Selamat! Anda adalah pengajar favorit siswa."
                                : `Butuh ${levelInfo.points_needed} poin lagi untuk jadi ${levelInfo.next_level}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black">{levelInfo.current_point}</span>
                        <span className="text-xs opacity-60 ml-1">/ {maxPoints}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                        <span>Guru Aktif</span>
                        <span>Guru Favorit</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-black/20" color="white" />
                </div>

                <div className="flex gap-4 pt-2">
                    <div className="flex-1 bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                        <div className="text-[10px] font-bold opacity-70 uppercase">Ulasan</div>
                        <div className="font-bold">{levelInfo.current_point}</div>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                        <div className="text-[10px] font-bold opacity-70 uppercase">Rating</div>
                        <div className="font-bold flex items-center justify-center gap-1">
                            4.9 <Star className="h-3 w-3 fill-white" />
                        </div>
                    </div>
                </div>

                <p className="text-[10px] opacity-60 italic leading-tight pt-2 border-t border-white/10">
                    * Predikat dihitung dari jumlah ulasan positif dan loyalitas murid.
                </p>
            </CardContent>
        </Card>
    )
}
