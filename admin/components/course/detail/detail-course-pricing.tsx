import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/utils/helpers/formatter"
import type { CourseDetail } from "@/utils/types"
import { Info } from "lucide-react"

type DetailCoursePricingProps = {
  variant?: "mobile" | "desktop"
  course: CourseDetail
}

export function DetailCoursePricing({ variant, course }: DetailCoursePricingProps) {
  const onlinePrice1 = course.coursePrices?.online?.find(p => p.durationInHour === 1)?.price
  const offlinePrice1 = course.coursePrices?.offline?.find(p => p.durationInHour === 1)?.price
  return (
    <>
      <div className="text-center">
        <div className="flex justify-center items-end gap-2 w-full">
          <span className={`font-extrabold ${variant === "mobile" ? "text-3xl" : "text-2xl"}`}>
            {formatRupiah(course.price)}
          </span>
          <span className="text-sm text-[#848484]">per jam</span>
        </div>
        {course.isFreeFirstCourse && (
          <>
            <span className="text-[#7000FE] text-[12px] font-bold">Kursus pertama gratis</span>
            <div className="text-[#A70000]">
              <div className="max-w-[250px] mx-auto flex items-start gap-2 justify-center">
                <Info className="size-4" />
                <span className="text-xs flex-1">
                  Sesi pertama sebagai perkenalan dan durasi maksimal 30 menit
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <Card className="p-4 bg-[#EDEDED] border-0 rounded-2xl w-full">
        <div className="grid grid-cols-2 divide-x divide-gray-300 text-sm">
          {/* Online Section */}
          {course.coursePrices?.online?.length > 0 && (
            <div className="pr-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-[#AFAFAF] text-[12px] font-extrabold tracking-wide uppercase">
                    ONLINE
                  </h2>
                  {onlinePrice1 !== undefined && (
                    <div className="text-black text-sm font-bold">
                      {formatRupiah(onlinePrice1)}
                      <span className="text-gray-400 text-xs font-normal">/Jam</span>
                    </div>
                  )}
                </div>

                {course.coursePrices?.online?.length > 1 && (
                  <div>
                    <h3 className="text-[#AFAFAF] text-[12px] font-extrabold tracking-wide uppercase">
                      PAKET
                    </h3>
                    <div className="text-[10px]">
                      {course.coursePrices?.online?.map(p =>
                        p.durationInHour !== 1 ? (
                          <div key={p.durationInHour} className="text-black font-medium">
                            {p.durationInHour} jam{" "}
                            <span className="font-extrabold">{formatRupiah(p.price)}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offline Section */}
          {course.coursePrices?.offline?.length > 0 && (
            <div className="pl-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-[#AFAFAF] text-[12px] font-extrabold tracking-wide uppercase">
                    OFFLINE
                  </h2>
                  {offlinePrice1 !== undefined && (
                    <div className="text-black text-sm font-bold">
                      {formatRupiah(offlinePrice1)}
                      <span className="text-gray-400 text-xs font-normal">/Jam</span>
                    </div>
                  )}
                </div>
                {course.coursePrices?.offline?.length > 1 && (
                  <div>
                    <h3 className="text-[#AFAFAF] text-[12px] font-extrabold tracking-wide uppercase">
                      PAKET
                    </h3>
                    <div className="text-[10px]">
                      {course.coursePrices?.offline?.map(p =>
                        p.durationInHour !== 1 ? (
                          <div key={p.durationInHour} className="text-black font-medium">
                            {p.durationInHour} jam{" "}
                            <span className="font-extrabold">{formatRupiah(p.price)}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  )
}
