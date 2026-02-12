"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUserProfile } from "@/context/user-profile"
import { formatRupiah } from "@/utils/helpers"
import type { Plan } from "@/utils/types/subscription"
import Image from "next/image"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const BENEFITS = [
  "Pencarian tanpa batas",
  "Booking tanpa batas",
  'Booking dengan label "pertemuan pertama gratis" 1 kali/hari tiap mata pelajaran',
]

type PlansProps = {
  plans?: Plan[]
}

export function Plans({ plans }: PlansProps) {
  const user = useUserProfile()
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const selectedPlan = useMemo(() => {
    if (!plans) return null
    return plans.find(plan => plan.interval === planType)
  }, [planType, plans])

  const handleSubscribe = async () => {
    try {
      if (selectedPlan) {
        const resp = await fetch(`/api/v1/students/subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscriptionId: selectedPlan.id,
            intervalCount: 1,
          }),
        })
        if (!resp.ok) {
          toast.error("Gagal melakukan langganan. Silakan coba lagi.")
          return
        }
        const res = await resp.json()
        if (!res.ok) {
          toast.error(res?.error || "Gagal melakukan langganan. Silakan coba lagi.")
          return
        }
        window.location.href = res?.data?.url
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
      console.error("Subscription error:", error)
    } finally {
      setIsDialogOpen(false)
    }
  }

  const handleClickPlan = () => {
    if (!user?.profile) {
      // set cookies with key 'target_path' and value '/plans'
      document.cookie = `target_path=${encodeURIComponent("/plans")}; path=/`
      user?.resetProfile()
      window.location.href = "/login"
      return
    }
    setIsDialogOpen(true)
  }

  const PlanToggle = () => (
    <div className="relative flex bg-white/10 backdrop-blur-md rounded-t-2xl w-fit mx-auto">
      <button
        onClick={() => setPlanType("monthly")}
        className={`px-6 py-2 rounded-t-2xl text-white transition-all duration-300 font-extrabold ${
          planType === "monthly" ? "bg-blue-700/65" : "bg-transparent"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setPlanType("yearly")}
        className={`px-6 py-2 rounded-t-2xl font-extrabold text-white flex items-center gap-2 transition-all duration-300 ${
          planType === "yearly" ? "bg-blue-700/65" : "bg-transparent"
        }`}
      >
        <div className="flex flex-col">
          <span>Yearly</span>
          <span className="text-xs ">lebih hemat 25%</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="33"
          viewBox="0 0 24 33"
          fill="none"
        >
          <path
            d="M20.8711 25.2822C21.9379 29.0639 22.4723 30.9547 21.7588 31.9893C21.5091 32.3521 21.175 32.6429 20.7861 32.8359C19.6786 33.3837 17.9658 32.5176 14.543 30.7852C13.4033 30.2094 12.8341 29.9202 12.2295 29.8574C12.0047 29.8356 11.7775 29.8356 11.5527 29.8574C10.9481 29.9202 10.3773 30.2077 9.23926 30.7852C5.81632 32.5176 4.10367 33.3837 2.99609 32.8359C2.60719 32.6429 2.27311 32.3522 2.02344 31.9893C1.31166 30.9547 1.84432 29.064 2.91113 25.2822L3.55566 23.002C5.99147 24.6796 8.90459 25.5787 11.8906 25.5742C14.8768 25.5788 17.7906 24.6797 20.2266 23.002L20.8711 25.2822ZM11.8916 0C15.0452 8.63164e-05 18.0698 1.21688 20.2998 3.38281C22.5298 5.54881 23.7822 8.48664 23.7822 11.5498C23.7822 14.613 22.5298 17.5508 20.2998 19.7168C18.0698 21.8827 15.0452 23.0995 11.8916 23.0996C8.73784 23.0996 5.71247 21.8828 3.48242 19.7168C1.2525 17.5508 5.26547e-06 14.6129 0 11.5498C0 8.48671 1.25251 5.5488 3.48242 3.38281C5.71247 1.21681 8.73784 0 11.8916 0ZM11.8916 6.59961C11.4092 6.59961 11.086 7.16116 10.4404 8.28809L10.2744 8.57812C10.0911 8.89802 9.99899 9.05651 9.85645 9.16211C9.71207 9.26769 9.5334 9.30724 9.17676 9.38477L8.85352 9.45801C7.60058 9.73339 6.97398 9.87013 6.82422 10.335C6.67473 10.8003 7.10256 11.2876 7.95703 12.2578L8.17773 12.5088C8.42055 12.7842 8.54331 12.9212 8.59766 13.0928C8.65189 13.2643 8.63331 13.4477 8.59766 13.8154L8.56348 14.1504C8.43439 15.4454 8.3698 16.0938 8.75879 16.3809C9.1495 16.668 9.7373 16.4056 10.9111 15.8809L11.2139 15.7461C11.5484 15.5976 11.715 15.5225 11.8916 15.5225C12.0681 15.5226 12.2349 15.5977 12.5693 15.7461L12.8711 15.8809C14.0447 16.4071 14.6327 16.6677 15.0234 16.3809C15.4141 16.0938 15.3478 15.4455 15.2188 14.1504L15.1855 13.8154C15.1499 13.4476 15.1312 13.2643 15.1855 13.0928C15.2399 12.9212 15.3618 12.7841 15.6045 12.5088L15.8252 12.2578C16.6797 11.2876 17.1085 10.8019 16.959 10.335C16.8093 9.86993 16.182 9.73347 14.9287 9.45801L14.6055 9.38477C14.2492 9.30731 14.0711 9.26922 13.9268 9.16211C13.7841 9.05652 13.6922 8.89816 13.5088 8.57812L13.3418 8.28809C12.6964 7.16142 12.3739 6.59987 11.8916 6.59961Z"
            fill="#EEB600"
          />
        </svg>
      </button>
    </div>
  )

  return (
    <>
      <div className="p-8 flex lg:flex-row flex-col gap-12 lg:gap-0">
        <div className="text-white lg:mt-22">
          <h3 className="text-2xl font-bold">Plans & Pricing</h3>
          <p className="text-sm">
            Mau dapet guru yang paling cocok? Pilih paketnya, dan temukan guru terbaik versi kamu!
          </p>
        </div>
        <div className="flex flex-col items-center justify-center lg:flex-1">
          <PlanToggle />
          <div className="flex flex-col md:flex-row gap-8 mt-12">
            {/* Free Plan */}
            <Card className="w-[320px] rounded-3xl shadow-xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <CardContent className="p-8">
                <h2 className="text-4xl font-extrabold mb-1">FREE</h2>
                <p className="text-sm mb-6">Basic Plan</p>
                <h3 className="font-semibold text-white/90 mb-4">BENEFIT</h3>

                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_2303_67775)">
                        <rect
                          x="3.02344"
                          y="2.74609"
                          width="9.84766"
                          height="10.032"
                          fill="#D9D9D9"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8 16C9.05058 16 10.0909 15.7931 11.0615 15.391C12.0321 14.989 12.914 14.3997 13.6569 13.6569C14.3997 12.914 14.989 12.0321 15.391 11.0615C15.7931 10.0909 16 9.05058 16 8C16 6.94943 15.7931 5.90914 15.391 4.93853C14.989 3.96793 14.3997 3.08601 13.6569 2.34315C12.914 1.60028 12.0321 1.011 11.0615 0.608964C10.0909 0.206926 9.05058 -1.56548e-08 8 0C5.87827 3.16163e-08 3.84344 0.842855 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16ZM7.79378 11.2356L12.2382 5.90222L10.8729 4.76444L7.05067 9.35022L5.07289 7.37156L3.816 8.62844L6.48267 11.2951L7.17067 11.9831L7.79378 11.2356Z"
                          fill="#006312"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2303_67775">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>{" "}
                    <span className="flex-1">Pencarian tanpa batas</span>
                  </li>
                  <li className="flex gap-2 text-white/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_2303_44488)">
                        <rect
                          x="3.02344"
                          y="2.74609"
                          width="9.84766"
                          height="10.032"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M2.34401 13.6566C1.57993 12.9187 0.970469 12.0359 0.551197 11.0599C0.131925 10.0839 -0.0887645 9.03409 -0.0979951 7.97186C-0.107226 6.90962 0.095188 5.85619 0.497435 4.87302C0.899682 3.88985 1.49371 2.99663 2.24485 2.24549C2.99599 1.49435 3.88921 0.900323 4.87238 0.498076C5.85555 0.0958289 6.90898 -0.106585 7.97122 -0.0973542C9.03345 -0.0881237 10.0832 0.132566 11.0592 0.551838C12.0353 0.97111 12.918 1.58057 13.656 2.34465C15.1133 3.85347 15.9196 5.87428 15.9014 7.97186C15.8832 10.0694 15.0418 12.0759 13.5586 13.5592C12.0753 15.0425 10.0688 15.8838 7.97122 15.902C5.87364 15.9203 3.85283 15.1139 2.34401 13.6566ZM9.12001 8.00065L11.384 5.73665L10.256 4.60865L8.00001 6.87265L5.73601 4.60865L4.60801 5.73665L6.87201 8.00065L4.60801 10.2646L5.73601 11.3926L8.00001 9.12865L10.264 11.3926L11.392 10.2646L9.12801 8.00065H9.12001Z"
                          fill="#A70000"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2303_44488">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>{" "}
                    <span className="flex-1">Booking tanpa batas</span>
                  </li>
                  <li className="flex gap-2 text-white/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_2303_44488)">
                        <rect
                          x="3.02344"
                          y="2.74609"
                          width="9.84766"
                          height="10.032"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M2.34401 13.6566C1.57993 12.9187 0.970469 12.0359 0.551197 11.0599C0.131925 10.0839 -0.0887645 9.03409 -0.0979951 7.97186C-0.107226 6.90962 0.095188 5.85619 0.497435 4.87302C0.899682 3.88985 1.49371 2.99663 2.24485 2.24549C2.99599 1.49435 3.88921 0.900323 4.87238 0.498076C5.85555 0.0958289 6.90898 -0.106585 7.97122 -0.0973542C9.03345 -0.0881237 10.0832 0.132566 11.0592 0.551838C12.0353 0.97111 12.918 1.58057 13.656 2.34465C15.1133 3.85347 15.9196 5.87428 15.9014 7.97186C15.8832 10.0694 15.0418 12.0759 13.5586 13.5592C12.0753 15.0425 10.0688 15.8838 7.97122 15.902C5.87364 15.9203 3.85283 15.1139 2.34401 13.6566ZM9.12001 8.00065L11.384 5.73665L10.256 4.60865L8.00001 6.87265L5.73601 4.60865L4.60801 5.73665L6.87201 8.00065L4.60801 10.2646L5.73601 11.3926L8.00001 9.12865L10.264 11.3926L11.392 10.2646L9.12801 8.00065H9.12001Z"
                          fill="#A70000"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2303_44488">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="flex-1">
                      Booking dengan label
                      <span className="font-bold">&quot;pertemuan pertama gratis&quot;</span> 1
                      kali/hari tiap mata pelajaran
                    </span>
                  </li>
                </ul>

                <Button
                  disabled
                  className="mt-8 w-full bg-white/10 border border-white/30 text-white cursor-not-allowed opacity-80"
                >
                  PAKET AKTIF
                </Button>
              </CardContent>
            </Card>

            {/* Paid Plan */}
            <Card className="bg-[#25064D] border-0 text-white w-[320px] rounded-3xl shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-1">IDR</h2>
                <div className="flex items-end gap-1">
                  <h1 className="text-5xl font-extrabold">
                    {formatRupiah(selectedPlan?.price || "0", { withSymbol: false })}
                  </h1>
                  {planType === "monthly" ? (
                    <p className="text-sm">/bulan</p>
                  ) : (
                    <p className="text-sm">/tahun</p>
                  )}
                </div>
                <p className="text-sm mb-6">Basic Plan</p>
                <h3 className="font-semibold text-[#7000FE] mb-4">BENEFIT</h3>

                <ul className="space-y-3 text-sm">
                  {BENEFITS.map((benefit, idx) => (
                    <li className="flex gap-2" key={idx}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_2303_67775)">
                          <rect
                            x="3.02344"
                            y="2.74609"
                            width="9.84766"
                            height="10.032"
                            fill="#D9D9D9"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8 16C9.05058 16 10.0909 15.7931 11.0615 15.391C12.0321 14.989 12.914 14.3997 13.6569 13.6569C14.3997 12.914 14.989 12.0321 15.391 11.0615C15.7931 10.0909 16 9.05058 16 8C16 6.94943 15.7931 5.90914 15.391 4.93853C14.989 3.96793 14.3997 3.08601 13.6569 2.34315C12.914 1.60028 12.0321 1.011 11.0615 0.608964C10.0909 0.206926 9.05058 -1.56548e-08 8 0C5.87827 3.16163e-08 3.84344 0.842855 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16ZM7.79378 11.2356L12.2382 5.90222L10.8729 4.76444L7.05067 9.35022L5.07289 7.37156L3.816 8.62844L6.48267 11.2951L7.17067 11.9831L7.79378 11.2356Z"
                            fill="#006312"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2303_67775">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span className="flex-1">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 w-full bg-main"
                  disabled={user?.profile?.isPremium}
                  onClick={() => handleClickPlan()}
                >
                  PILIH PAKET
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Langganan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin berlangganan paket{" "}
                <span className="font-semibold">
                  {planType === "monthly" ? "Bulanan" : "Tahunan"}
                </span>{" "}
                seharga{" "}
                <span className="font-semibold">{formatRupiah(selectedPlan?.price || "0")}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubscribe} className="bg-main">
                Ya, Langganan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bottom Illustration */}
      <div className="w-full mt-8 md:mt-12">
        <div className="relative w-full h-32 md:h-48 lg:h-64">
          <Image
            src="/illus-plans.png"
            alt="Plans Illustration"
            width={300}
            height={300}
            className="object-cover object-bottom w-full"
            priority
          />
        </div>
      </div>
    </>
  )
}
