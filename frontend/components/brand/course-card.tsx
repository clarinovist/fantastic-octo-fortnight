import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatRupiah } from "@/utils/helpers"
import type { Course } from "@/utils/types"
import { Star, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function CourseCard({
  course,
  isBookable,
  className,
}: {
  course: Course
  isBookable: boolean
  className?: string
}) {
  const [showBookedDialog, setShowBookedDialog] = useState(false)
  const isOnline = course.tutor.classType === "online"
  const isOffline = course.tutor.classType === "offline"
  const isBoth = course.tutor.classType === "all"

  const handleBookedButtonClick = () => {
    if (course.isBooked) {
      setShowBookedDialog(true)
    }
  }

  return (
    <div className={`bg-[#F3F0E9] shadow-main rounded-lg overflow-hidden ${className}`}>
      {/* Course Info */}
      <div className="p-[22px]">
        <h3 className="font-bold font-lato text-[28px] leading-[100%]">{course.tutor.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 12 13"
            fill="none"
          >
            <path
              d="M1.75714 1.65946C4.10004 -0.553154 7.89898 -0.553154 10.2426 1.65946C12.5862 3.87208 12.5855 7.45742 10.2426 9.67003L9.42462 10.4332C8.64503 11.1543 7.86268 11.8727 7.07759 12.5885C6.78846 12.8525 6.40202 13 5.99985 13C5.59768 13 5.21124 12.8525 4.92212 12.5885L2.51651 10.3785C2.21423 10.0983 1.96111 9.86195 1.75714 9.66938C0.632055 8.60708 0 7.16635 0 5.6641C0 4.16185 0.632055 2.72111 1.75714 1.65881M5.99985 3.89095C5.72837 3.89095 5.45956 3.94143 5.20874 4.03951C4.95793 4.1376 4.73004 4.28136 4.53807 4.4626C4.34611 4.64383 4.19384 4.85899 4.08995 5.09579C3.98606 5.33258 3.93259 5.58638 3.93259 5.84268C3.93259 6.09899 3.98606 6.35278 4.08995 6.58958C4.19384 6.82637 4.34611 7.04153 4.53807 7.22277C4.73004 7.404 4.95793 7.54777 5.20874 7.64585C5.45956 7.74393 5.72837 7.79442 5.99985 7.79442C6.54812 7.79442 7.07394 7.58879 7.46163 7.22277C7.84932 6.85675 8.06712 6.36031 8.06712 5.84268C8.06712 5.32505 7.84932 4.82862 7.46163 4.4626C7.07394 4.09658 6.54812 3.89095 5.99985 3.89095Z"
              fill="#7000FE"
            />
          </svg>
          <p className="text-sm text-[#848484] line-clamp-1">{course.tutor?.location?.fullName}</p>
        </div>
        <p className="text-sm leading-[120%] mb-3 line-clamp-2">{course.description}</p>

        {/* Online/Offline Status */}
        <div className="flex space-x-2">
          {(isOnline || isBoth) && (
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="9"
                viewBox="0 0 12 9"
                fill="none"
              >
                <path
                  d="M11.9996 3.26851V6.20289C12.0055 6.4214 11.9484 6.63762 11.835 6.82638C11.7113 7.01568 11.5363 7.16809 11.3294 7.26682C11.165 7.34651 10.9838 7.38765 10.8002 7.38695H10.6532C10.4382 7.35746 10.2352 7.27253 10.0653 7.14098L8.57786 5.99697V6.5175C8.57786 7.1759 8.30903 7.80733 7.83051 8.27289C7.352 8.73845 6.70299 9 6.02626 9H2.55162C1.87514 8.99848 1.22657 8.73744 0.74669 8.27355C0.508744 8.04366 0.320187 7.77 0.191999 7.46852C0.0638105 7.16704 -0.00144779 6.84375 2.43632e-05 6.5175V2.98823C-0.000597525 2.66234 0.0653516 2.33958 0.19404 2.0387C0.453917 1.42928 0.95039 0.944191 1.57567 0.688766C1.88492 0.563562 2.21666 0.499399 2.55162 0.500004H5.95571C6.2925 0.500142 6.62602 0.564263 6.93755 0.688766C7.56282 0.944191 8.0593 1.42928 8.31917 2.0387C8.44852 2.34129 8.51319 2.66619 8.50731 2.99395V3.50875L9.99476 2.36474C10.1301 2.26127 10.2863 2.18662 10.4532 2.14563C10.6201 2.10465 10.794 2.09824 10.9636 2.12682C11.1332 2.1554 11.2948 2.21834 11.4378 2.31155C11.5808 2.40476 11.7021 2.52617 11.7938 2.6679C11.9155 2.84694 11.9867 3.05401 11.9996 3.26851Z"
                  fill="#848484"
                />
              </svg>
              <span className="font-lato font-extrabold text-[#848484]">ONLINE</span>
            </div>
          )}
          {isBoth && <div className="border-l-2 border-gray-500" />}
          {(isOffline || isBoth) && (
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="10"
                viewBox="0 0 12 10"
                fill="none"
              >
                <path
                  d="M3.75913 4.86364C4.37265 4.86364 4.96105 4.63377 5.39488 4.2246C5.82871 3.81543 6.07244 3.26047 6.07244 2.68182C6.07244 2.10316 5.82871 1.54821 5.39488 1.13904C4.96105 0.729869 4.37265 0.5 3.75913 0.5C3.1456 0.5 2.5572 0.729869 2.12337 1.13904C1.68954 1.54821 1.44582 2.10316 1.44582 2.68182C1.44582 3.26047 1.68954 3.81543 2.12337 4.2246C2.5572 4.63377 3.1456 4.86364 3.75913 4.86364ZM8.96407 4.86364C9.42422 4.86364 9.86552 4.69123 10.1909 4.38436C10.5163 4.07748 10.6991 3.66126 10.6991 3.22727C10.6991 2.79328 10.5163 2.37707 10.1909 2.07019C9.86552 1.76331 9.42422 1.59091 8.96407 1.59091C8.50393 1.59091 8.06263 1.76331 7.73725 2.07019C7.41188 2.37707 7.22909 2.79328 7.22909 3.22727C7.22909 3.66126 7.41188 4.07748 7.73725 4.38436C8.06263 4.69123 8.50393 4.86364 8.96407 4.86364ZM1.08436 5.68182C0.796772 5.68182 0.52096 5.78957 0.317603 5.98137C0.114245 6.17317 0 6.4333 0 6.70455V7.04545C0 7.04545 0 9.5 3.75913 9.5C7.51825 9.5 7.51825 7.04545 7.51825 7.04545V6.70455C7.51825 6.4333 7.40401 6.17317 7.20065 5.98137C6.99729 5.78957 6.72148 5.68182 6.43389 5.68182H1.08436ZM7.42399 8.70609C7.82188 8.85827 8.32589 8.95455 8.96378 8.95455C12 8.95455 12 6.77273 12 6.77273V6.70455C12 6.43335 11.8858 6.17326 11.6825 5.98146C11.4792 5.78967 11.2035 5.68189 10.9159 5.68182H7.69378C7.95375 5.96609 8.09653 6.32914 8.096 6.70455V7.05773L8.09571 7.07327L8.09398 7.11418C8.09244 7.14564 8.08906 7.18473 8.08386 7.23145C8.06936 7.35324 8.04617 7.47397 8.01446 7.59282C7.90482 7.99964 7.70341 8.37937 7.42399 8.70609Z"
                  fill="#848484"
                />
              </svg>
              <span className="font-lato font-extrabold text-[#848484]">OFFLINE</span>
            </div>
          )}
        </div>
      </div>
      {/* Teacher Image */}
      <div className="relative h-48">
        {course.tutor.photoProfile ? (
          <Image
            src={course.tutor.photoProfile || "/teacher.png"}
            alt="Teacher"
            fill
            className="object-cover w-full h-full rounded-2xl"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
            <User className="w-20 h-20 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <div
            className={`flex flex-wrap lg:flex-nowrap items-center ${course.isFreeFirstCourse ? "lg:justify-center" : ""} lg:gap-0 gap-2`}
          >
            <div className="bg-main font-lato font-bold text-white text-xs px-2 py-1 rounded-full w-fit z-2">
              {course.tutor.level}
            </div>
            {course.isFreeFirstCourse && (
              <div className="bg-white font-lato font-bold text-xs px-2 py-1 rounded-full lg:ml-[-26px] lg:text-right lg:w-[190px]">
                Kursus Pertama Gratis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating and Price */}
      <div className="px-[22px] pt-2">
        <div className="flex items-start justify-between text-[#848484] font-lato">
          <div className="flex flex-wrap xxl:flex-nowrap items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-extrabold">{course.tutor.rating}</span>
            <span className="text-xs ml-1 font-medium">({course.tutor.totalRating} ulasan)</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-[#000000]">{formatRupiah(course.price)}</div>
            <div className="text-xs font-extrabold">per jam</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`p-4 flex gap-2 ${isBookable ? "justify-around" : ""}`}>
        <Link href={`/${course.id}`}>
          <Button
            variant="ghost"
            size="lg"
            className="font-extrabold text-main hover:bg-purple-50 bg-transparent"
          >
            DETAIL
          </Button>
        </Link>
        {isBookable && (
          <>
            {course.isBooked ? (
              <Button
                size="lg"
                className="font-extrabold bg-gray-400 hover:bg-gray-400"
                onClick={handleBookedButtonClick}
              >
                BOOK!
              </Button>
            ) : (
              <Link href={`${course.id}/booking`}>
                <Button size="lg" className="font-extrabold bg-main hover:bg-main/50">
                  BOOK!
                </Button>
              </Link>
            )}
          </>
        )}
      </div>

      {/* Booked Status Dialog */}
      <Dialog open={showBookedDialog} onOpenChange={setShowBookedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-lato font-bold">Kursus Sudah Dibooking</DialogTitle>
            <DialogDescription className="font-lato">
              Kursus ini sudah Anda booking dan sedang dalam proses persetujuan dari tutor. Silakan
              tunggu konfirmasi dari tutor untuk melanjutkan pembelajaran.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowBookedDialog(false)}
              className="font-extrabold bg-main hover:bg-main/50"
            >
              Mengerti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
