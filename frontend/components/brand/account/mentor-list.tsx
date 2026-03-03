"use client"

import { BaseResponse, StudentTutorResponse } from "@/utils/types"
import Image from "next/image"
import useSWR from "swr"

const fetcher = async (url: string): Promise<BaseResponse<StudentTutorResponse[]>> => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Failed to fetch mentors")
    }
    return response.json()
}

export function MentorList() {
    const { data, error, isLoading } = useSWR<BaseResponse<StudentTutorResponse[]>>(
        "/api/v1/students/tutors",
        fetcher
    )

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 font-gochi-hand text-main">My Mentors / Teachers</h2>
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
                </div>
            </div>
        )
    }

    if (error || !data?.success) {
        return null // Gracefully degrade if we can't fetch it
    }

    const mentors = data.data || []

    if (mentors.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 font-gochi-hand text-main">My Mentors / Teachers</h2>
                <div className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">
                    You are not connected to any mentor yet.
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 font-gochi-hand text-main">My Mentors / Teachers</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {mentors.map((mentor) => (
                    <div key={mentor.tutor_id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
                            <Image
                                src={mentor.photo_profile || "/images/default-avatar.png"}
                                alt={mentor.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{mentor.name || "Unknown"}</h3>
                            <p className="text-xs text-gray-500">
                                Joined: {new Date(mentor.joined_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
