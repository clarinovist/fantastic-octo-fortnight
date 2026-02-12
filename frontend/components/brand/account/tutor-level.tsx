import { Card } from "@/components/ui/card"
import Image from "next/image"

type TutorLevelProps = {
  point: number
}

export function TutorLevel(props: TutorLevelProps) {
  const isCompleted = props.point >= 25
  return (
    <div className="relative">
      <div
        className={`${isCompleted ? "bg-[#FECB00] text-black" : "bg-main text-white"} px-6 rounded-t-2xl w-fit py-2 z-20`}
      >
        <h2 className="text-lg font-bold">Predikat</h2>
      </div>

      <Card className="w-full border-0 rounded-2xl overflow-hidden py-0 rounded-tl-none">
        <div className={`${isCompleted ? "bg-[#FECB00]" : "bg-main"} text-white relative pt-16`}>
          {/* Progress Bar */}
          <div className="relative flex items-center justify-between px-8 pt-16 pb-16">
            {/* Bar with white progress line */}
            <div className="flex-1 h-2 bg-black/25 rounded-full relative">
              <div
                className="absolute h-2 bg-white rounded-full left-0 top-0"
                style={{ width: `${Math.min((props.point / 25) * 100, 100)}%` }}
              />

              <div className="flex relative top-[-25px]">
                <div className="flex flex-col items-center ml-[30%] relative">
                  {/* Left Icon */}
                  <div className="absolute top-[-125px] left-[-30] w-[130px]">
                    <Image
                      src="/guru-aktif.png"
                      alt="Guru Aktif"
                      className="w-full"
                      width={120}
                      height={80}
                    />
                  </div>
                  <div className="w-14 h-14 border-5 border-white rounded-full bg-main flex items-center justify-center text-white font-bold text-lg shadow-md">
                    10
                  </div>
                  <p
                    className={`${isCompleted ? "text-black" : "text-white"} mt-2 text-sm font-bold`}
                  >
                    Guru Aktif
                  </p>
                </div>

                <div className="flex flex-col items-end ml-auto relative">
                  {/* Right Icon */}
                  <div className="absolute top-[-100px] right-[-40] w-[150px]">
                    <Image
                      src="/guru-favorit.png"
                      alt="Guru Favorit"
                      className="w-full"
                      width={120}
                      height={80}
                    />
                  </div>
                  <div
                    className={`${isCompleted ? "bg-[#FECB00] border-white text-[#907300]" : "bg-[#B4B4B4] border-[#6C6C6C] text-white"} w-14 h-14 border-5 rounded-full flex items-center justify-center font-bold text-lg shadow-md`}
                  >
                    25
                  </div>
                  <p
                    className={`${isCompleted ? "text-black" : "text-white"} mt-2 text-sm font-bold`}
                  >
                    Guru Favorit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p
            className={`${isCompleted ? "text-black" : "text-white/80"} px-8 pb-6 text-xs max-w-xl`}
          >
            Predikat dihitung berdasarkan banyaknya murid yang memberi ulasan dan menyatakan memakai
            jasa tutor kedepannya
          </p>
        </div>
      </Card>
    </div>
  )
}
