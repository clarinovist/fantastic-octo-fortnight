"use client"

import { CourseCard } from "@/components/brand/course-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useUserProfile } from "@/context/user-profile"
import type { Course } from "@/utils/types"
import { Suspense, use } from "react"
import { CourseCardSkeleton } from "../skeleton/course-card-skeleton"

interface CourseRecommendationProps {
  courses: Promise<{ data: Course[] }>
}

function CourseRecommendationContent({ courses }: CourseRecommendationProps) {
  const user = useUserProfile()
  const { data } = use(courses)

  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-4">Rekomendasi Tutor Lain</h3>
      <div className="md:block hidden">
        <Carousel className="flex items-center">
          {data.length > 4 && <CarouselPrevious className="left-0 relative translate-0" />}
          <CarouselContent>
            {data.map(course => (
              <CarouselItem key={course.id} className="basis-xs">
                <CourseCard
                  course={course}
                  isBookable={!user?.profile?.role || user?.profile?.role === "student"}
                  className="w-[296px]"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {data.length > 4 && <CarouselNext className="left-0 relative translate-0" />}
        </Carousel>
      </div>
      <div className="md:hidden flex flex-col">
        {data.map(course => (
          <div key={course.id} className="mb-4 last:mb-0 px-2">
            <CourseCard
              isBookable={!user?.profile?.role || user?.profile?.role === "student"}
              course={course}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CourseRecommendationSkeleton() {
  return (
    <div className="w-full">
      <div className="lg:block hidden">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-2 max-w-[296px]">
              <CourseCardSkeleton />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:hidden flex flex-col">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="mb-4 last:mb-0 px-2">
            <CourseCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CourseRecommendation({ courses }: CourseRecommendationProps) {
  return (
    <div className="w-full">
      <Suspense fallback={<CourseRecommendationSkeleton />}>
        <CourseRecommendationContent courses={courses} />
      </Suspense>
    </div>
  )
}
