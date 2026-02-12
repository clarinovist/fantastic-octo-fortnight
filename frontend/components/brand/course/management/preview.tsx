"use client"

import { useUserProfile } from "@/context/user-profile"
import { COURSE_STATUS } from "@/utils/constants"
import type { CourseDetail, CourseDetailSaved } from "@/utils/types"
import { DetailCourse } from "../detail/detail-course"
import { PreviewAction } from "./preview-action"

interface PreviewProps {
  detail: CourseDetailSaved
}

export function Preview({ detail }: PreviewProps) {
  const user = useUserProfile()

  // Transform CourseDetailSaved to CourseDetail format
  const transformedCourse: CourseDetail = {
    id: detail.id,
    courseCategory: detail.draft?.courseCategory ?? detail?.courseCategory,
    levelEducationCourse: detail.draft?.levelEducationCourses ?? detail.levelEducationCourses,
    totalStudentEnrollment: 0, // Hardcoded as requested
    relatedCourses: [], // Empty array for preview
    title: detail.draft?.title ?? detail.title,
    tutor: {
      id: "preview-tutor", // Hardcoded for preview
      name: user?.profile?.name || "", // Use profile context here
      photoProfile: user?.profile?.photo_profile ?? null, // Will use default image
      classType: detail.draft?.classType ?? detail?.classType,
      latitude: user?.profile?.latitude ?? 0,
      longitude: user?.profile?.longitude ?? 0,
      level: user?.profile?.level ?? "",
      levelOfEducation: "Bachelor", // Hardcoded for preview
      responseTime: 60, // Hardcoded for preview
      rating: "4.8", // Hardcoded for preview
      totalRating: 24, // Hardcoded for preview
      description: detail.draft?.tutorDescription ?? detail?.tutorDescription,
      onlineChannel:
        detail.draft?.onlineChannel?.map(channel => ({
          channel,
          imageURL: "", // Default empty imageURL
        })) ??
        detail?.onlineChannel?.map(ch => ({
          channel: ch,
          imageURL: "",
        })),
      location: {
        id: "preview-location",
        name: user?.profile?.location.name ?? "",
        fullName: user?.profile?.location.fullName ?? "",
        shortName: user?.profile?.location.shortName,
        type: user?.profile?.location.type ?? "",
      },
      ratings: [], // Empty array for preview
    },
    coursePrices: detail.draft?.coursePrices ?? detail?.coursePrices,
    isFreeFirstCourse: detail.draft?.isFreeFirstCourse ?? detail?.isFreeFirstCourse,
    description: detail.draft?.description ?? detail?.description,
    courseSchedulesOffline:
      detail.draft?.courseSchedulesOffline ?? detail?.courseSchedulesOffline ?? {},
    courseSchedulesOnline:
      detail.draft?.courseSchedulesOnline ?? detail?.courseSchedulesOnline ?? {},
    price: detail?.draft?.price ?? detail?.price ?? "0",
    isBooked: false,
  }

  // Create empty recommendations promise for preview
  const emptyRecommendations = Promise.resolve({ data: [] })

  return (
    <div className="relative">
      <div className="fixed top-0 w-full md:w-fit md:right-8 right-0 z-1 md:bg-white p-4">
        <PreviewAction
          id={detail.id}
          isPublished={detail.isPublished}
          status={detail.status || COURSE_STATUS.DRAFT}
        />
      </div>
      <div className="p-4">
        <DetailCourse
          isBookable={false}
          course={transformedCourse}
          recommendations={emptyRecommendations}
        />
      </div>
    </div>
  )
}
