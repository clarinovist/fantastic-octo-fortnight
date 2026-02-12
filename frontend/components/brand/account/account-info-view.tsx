"use client"

import { logoutAction } from "@/actions/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/helpers/formatter"
<<<<<<< HEAD
import { IS_PREMIUM_ENABLED } from "@/utils/constants"
=======
>>>>>>> 1a19ced (chore: update service folders from local)
import type { MeResponse } from "@/utils/types"
import { Lock, Pencil, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { SubscriptionContainer } from "../subscriptions/subscription-container"

type AccountInfoViewProps = {
  detail: MeResponse
  onEdit?: () => void
}

export function AccountInfoView({ detail, onEdit }: AccountInfoViewProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    setTimeout(() => {
      router.refresh()
    }, 500)
  }

  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-md relative">
        {/* Edit button */}
        <button className="absolute top-4 right-4 text-purple-600" onClick={onEdit}>
          <Pencil className="w-6 h-6" />
        </button>

        {/* Profile Image */}
        <div
          className={cn(
            "w-40 h-40 mx-auto relative",
            detail.isPremium && "ring-4 ring-[#EEB600] rounded-2xl"
          )}
        >
          {detail.photo_profile ? (
            <Image
              src={detail.photo_profile}
              alt="Profile"
              fill
              className="rounded-2xl object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
              <User className="w-20 h-20 text-gray-400" />
            </div>
          )}
          {/* Premium Badge */}
          {detail.isPremium && (
            <div className="absolute bottom-[-25px] right-[-25px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="none"
              >
                <g clip-path="url(#clip0_2404_55582)">
                  <circle cx="27" cy="27" r="27" fill="#EEB600" />
                  <path
                    d="M27.0001 14.7773C26.7776 14.7772 26.5588 14.8341 26.365 14.9426C26.1713 15.051 26.0091 15.2074 25.8943 15.3964L20.3703 24.4973L12.2236 19.2468C12.0153 19.1128 11.7723 19.0412 11.524 19.0408C11.2756 19.0403 11.0324 19.1109 10.8236 19.2442C10.6147 19.3775 10.4491 19.5677 10.3466 19.792C10.2441 20.0163 10.2092 20.2652 10.2459 20.5087L12.8255 37.5614C12.8713 37.8645 13.0253 38.1412 13.2595 38.3412C13.4937 38.5412 13.7925 38.6511 14.1016 38.651H39.8986C40.2077 38.6511 40.5065 38.5412 40.7407 38.3412C40.9749 38.1412 41.1289 37.8645 41.1747 37.5614L43.7544 20.5087C43.7911 20.2652 43.7561 20.0163 43.6536 19.792C43.5511 19.5677 43.3855 19.3775 43.1767 19.2442C42.9678 19.1109 42.7246 19.0403 42.4762 19.0408C42.2279 19.0412 41.9849 19.1128 41.7766 19.2468L33.6299 24.4973L28.1059 15.3981C27.9913 15.2087 27.8292 15.0521 27.6355 14.9433C27.4417 14.8345 27.2228 14.7774 27.0001 14.7773Z"
                    fill="white"
                  />
                  <path
                    d="M26.1673 1.70721C25.5395 1.6962 25.0215 2.19632 25.0104 2.82407C24.9994 3.45182 25.4995 3.96986 26.1273 3.98089C32.2622 4.08852 37.2441 6.79799 41.0095 10.203C44.7857 13.6179 47.2798 17.6834 48.4056 20.3402C48.6506 20.9183 49.318 21.1885 49.8961 20.9436C50.4741 20.6987 50.7444 20.0312 50.4995 19.4532C49.2569 16.5206 46.5784 12.1737 42.5343 8.51661C38.4792 4.84952 32.9924 1.82696 26.1673 1.70721Z"
                    fill="white"
                  />
                  <circle cx="51.1578" cy="23.8751" r="1.13684" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_2404_55582">
                    <rect width="54" height="54" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mt-6">
          <p className="text-gray-500 text-sm">Nama</p>
          <p className="text-lg font-semibold">{detail.name || "-"}</p>
        </div>

        {/* Gender & DOB */}
        <div className="mt-4 flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Gender</p>
            <p className="font-semibold">{detail.gender || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tanggal Lahir</p>
            <p className="font-semibold">
              {detail.date_of_birth ? formatDate(detail.date_of_birth) : "-"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="mt-4">
          <p className="text-gray-500 text-sm">Email</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{detail.email}</p>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Phone */}
        <div className="mt-4">
          <p className="text-gray-500 text-sm">Nomor Handphone</p>
          <p className="font-semibold">{detail.phone_number || "-"}</p>
        </div>

        {/* Social Media */}
        <div className="mt-4">
          <p className="text-gray-500 text-sm">Social Media</p>
          <div className="space-y-2 mt-1">
            {Object.keys(detail.social_media_link).length === 0 && (
              <p className="text-gray-400 italic">Belum ada social media</p>
            )}
            {detail.social_media_link.tiktok && (
              <div className="flex items-center gap-2">
                <Icon name="tiktok" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.tiktok}</p>
              </div>
            )}
            {detail.social_media_link.instagram && (
              <div className="flex items-center gap-2">
                <Icon name="instagram" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.instagram}</p>
              </div>
            )}
            {detail.social_media_link.threads && (
              <div className="flex items-center gap-2">
                <Icon name="threads" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.threads}</p>
              </div>
            )}
            {detail.social_media_link.x && (
              <div className="flex items-center gap-2">
                <Icon name="x" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.x}</p>
              </div>
            )}
            {detail.social_media_link.linkedin && (
              <div className="flex items-center gap-2">
                <Icon name="linkedin" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.linkedin}</p>
              </div>
            )}
            {detail.social_media_link.youtube && (
              <div className="flex items-center gap-2">
                <Icon name="youtube" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.youtube}</p>
              </div>
            )}
            {detail.social_media_link.link && (
              <div className="flex items-center gap-2">
                <Icon name="link" className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{detail.social_media_link.link}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-2 flex flex-col items-center">
<<<<<<< HEAD
          {IS_PREMIUM_ENABLED && detail?.role === "student" && (
=======
          {detail?.role === "student" && (
>>>>>>> 1a19ced (chore: update service folders from local)
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-blue-600 font-medium cursor-pointer">
                  KELOLA LANGGANAN
                </button>
              </DialogTrigger>
              <DialogContent className="md:min-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="font-bold">KELOLA LANGGANAN</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] py-4">
                  <SubscriptionContainer />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <button className="text-blue-600 font-medium cursor-pointer">CHANGE PASSWORD</button>
          <button className="text-blue-600 font-medium cursor-pointer" onClick={handleLogout}>
            LOG OUT
          </button>
        </div>
      </div>
    </>
  )
}
