"use client"

import { resetPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type IconProps = {
  className?: string
  fill?: string
}

const EyeOpen = ({ className, fill = "#7000FE" }: IconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M1.93856 10.4481C1.84906 10.6857 1.66779 10.88 1.43329 10.9898C1.19879 11.0995 0.929529 11.116 0.682722 11.0357C0.435915 10.9555 0.231015 10.7848 0.111556 10.56C-0.0079017 10.3352 -0.0325019 10.0739 0.0429829 9.83171C0.079603 9.72501 0.120966 9.61797 0.166955 9.51476C0.246938 9.33004 0.364912 9.07532 0.526876 8.77393C0.856803 8.17115 1.37069 7.3681 2.12852 6.56504C3.65818 4.94143 6.16363 3.33337 9.98878 3.33337C13.8139 3.33337 16.3194 4.94143 17.849 6.56504C18.6649 7.43657 19.327 8.43324 19.8086 9.51476L19.9006 9.73449C19.9066 9.75004 19.9266 9.85115 19.9466 9.94837L19.9866 10.1389C19.9866 10.1389 20.1545 10.7864 19.3027 11.0606C19.0519 11.1421 18.778 11.1235 18.5412 11.0091C18.3043 10.8947 18.1238 10.6937 18.039 10.45V10.4442L18.027 10.4131L17.965 10.2614C17.5722 9.38789 17.0353 8.58265 16.3754 7.87754C15.1556 6.58837 13.1621 5.27782 9.98878 5.27782C6.81548 5.27782 4.82192 6.58643 3.60219 7.87949C2.94248 8.584 2.40553 9.38858 2.01255 10.2614L1.95256 10.4131L1.93856 10.4481ZM5.98967 11.1112C5.98967 10.0798 6.411 9.0906 7.16098 8.36129C7.91096 7.63198 8.92815 7.22226 9.98878 7.22226C11.0494 7.22226 12.0666 7.63198 12.8166 8.36129C13.5666 9.0906 13.9879 10.0798 13.9879 11.1112C13.9879 12.1425 13.5666 13.1317 12.8166 13.861C12.0666 14.5903 11.0494 15 9.98878 15C8.92815 15 7.91096 14.5903 7.16098 13.861C6.411 13.1317 5.98967 12.1425 5.98967 11.1112Z"
        fill={fill}
      />
    </svg>
  )
}

const EyeClosed = ({ className, fill = "#7000FE" }: IconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="9"
      viewBox="0 0 20 9"
      fill="none"
    >
      <path
        d="M17.1956 0.748996C17.3979 0.655911 17.6319 0.641023 17.8462 0.70729C18.5713 0.929475 18.4312 1.45251 18.4302 1.45644L18.3968 1.61091C18.3797 1.69 18.3619 1.7728 18.3567 1.78545L18.2783 1.96463C18.2138 2.10261 18.1435 2.23797 18.0715 2.37242L19.7498 3.92479C20.0834 4.23364 20.0834 4.73581 19.7498 5.04466C19.4163 5.35296 18.8754 5.35302 18.5419 5.04466L17.1489 3.75488C16.9774 3.96471 16.7968 4.16838 16.605 4.36347C15.865 5.11123 14.8563 5.85306 13.5286 6.35761L14.0057 8.00421C14.1276 8.42594 13.8572 8.85953 13.4018 8.9727C12.9461 9.08573 12.4779 8.83533 12.3557 8.41354L11.8902 6.81019C11.2755 6.92374 10.6097 6.99246 9.88822 6.99246C8.92075 6.99242 8.05306 6.8746 7.27559 6.6789L6.77509 8.41354C6.65305 8.83522 6.1845 9.08532 5.72903 8.9727C5.27335 8.85965 5.00299 8.4261 5.12509 8.00421L5.65396 6.17534C5.65984 6.15504 5.66988 6.13614 5.67732 6.11665C4.62754 5.63105 3.80288 4.99988 3.17313 4.36347C3.00796 4.19682 2.85656 4.03004 2.71767 3.8661C2.70044 3.88542 2.68547 3.9067 2.66595 3.92479L1.45807 5.04466C1.12461 5.35301 0.583678 5.35297 0.250187 5.04466C-0.0833958 4.73581 -0.0833958 4.23364 0.250187 3.92479L1.45807 2.80647C1.56504 2.70753 1.69423 2.64268 1.83011 2.60721C1.82211 2.59347 1.81284 2.58054 1.80509 2.56705C1.66672 2.3219 1.56478 2.11489 1.49644 1.96463C1.45718 1.88074 1.42261 1.7934 1.39134 1.70668C1.32684 1.50967 1.34767 1.29642 1.44973 1.11353C1.55182 0.930841 1.72784 0.792607 1.93855 0.727371C2.14926 0.662294 2.37903 0.675263 2.5792 0.764442C2.77943 0.85368 2.93481 1.0115 3.0113 1.20467L3.02298 1.23402L3.0747 1.35759C3.41042 2.06731 3.86929 2.7217 4.43273 3.29458C5.47481 4.34626 7.17755 5.41061 9.88822 5.41074C12.5994 5.41074 14.3033 4.3448 15.3454 3.29612C15.909 2.72271 16.3679 2.06794 16.7034 1.35759L16.7568 1.23402L16.7668 1.20776V1.20312C16.8393 1.00521 16.9935 0.842041 17.1956 0.748996Z"
        fill={fill}
      />
    </svg>
  )
}

const KeyIcon = ({ className, fill = "white" }: IconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="13"
      viewBox="0 0 24 13"
      fill="none"
    >
      <path
        d="M6.54545 9.75C7.45455 9.75 8.22727 9.43403 8.86364 8.80208C9.5 8.17014 9.81818 7.40278 9.81818 6.5C9.81818 5.59722 9.5 4.82986 8.86364 4.19792C8.22727 3.56597 7.45455 3.25 6.54545 3.25C5.63636 3.25 4.86364 3.56597 4.22727 4.19792C3.59091 4.82986 3.27273 5.59722 3.27273 6.5C3.27273 7.40278 3.59091 8.17014 4.22727 8.80208C4.86364 9.43403 5.63636 9.75 6.54545 9.75ZM6.54545 13C4.72727 13 3.18182 12.3681 1.90909 11.1042C0.636364 9.84028 0 8.30556 0 6.5C0 4.69444 0.636364 3.15972 1.90909 1.89583C3.18182 0.631945 4.72727 0 6.54545 0C8.01818 0 9.30473 0.415278 10.4051 1.24583C11.5055 2.07639 12.2735 3.10556 12.7091 4.33333H21.8455L24 6.47292L20.1818 10.8063L17.4545 8.66667L15.2727 10.8333L13.0909 8.66667H12.7091C12.2545 9.96667 11.4636 11.0139 10.3364 11.8083C9.20909 12.6028 7.94545 13 6.54545 13Z"
        fill={fill}
      />
    </svg>
  )
}

// Zod schema for form validation
const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, {
      message: "Password minimal 8 karakter",
    }),
    confirmPassword: z.string().min(1, {
      message: "Konfirmasi password wajib diisi",
    }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

// Loading skeleton component
const ChangePasswordFormSkeleton = () => {
  return (
    <Card className="w-full p-4 mx-4 bg-white border-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] rounded-3xl">
      <div className="flex flex-wrap items-center md:flex-row flex-col gap-8">
        <div className="w-full lg:max-w-[524px] lg:max-h-full max-h-[136px] bg-gray-200 animate-pulse rounded-lg" />
        <div className="space-y-6 flex-1 md:px-4">
          <div className="flex justify-center items-center flex-col gap-4">
            <div className="w-[214px] h-[62px] bg-gray-200 animate-pulse rounded" />
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-12 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded mx-auto" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// Internal component that uses useSearchParams
function ChangePasswordFormInternal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const {
    formState: { errors },
  } = form

  async function onSubmit(values: ChangePasswordFormValues) {
    if (!token) {
      setSubmitError("Token tidak valid. Silakan gunakan link reset password yang baru.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("newPassword", values.newPassword)

      const response = await resetPasswordAction(formData)

      if (response.success) {
        setSubmitSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setSubmitError(response.message || "Gagal mengubah password. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Change password error:", error)
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const classNameInputPassword = (isError: boolean) => {
    return `focus-visible:border-main focus-visible:ring-0 border-2 pl-16 pr-16 py-6 text-lg rounded-full placeholder:text-main-300 ${
      isError
        ? "focus-visible:border-red-500 border-red-500 placeholder:opacity-75 placeholder:text-[#FF000440]"
        : "border-main/50"
    }`
  }

  return (
    <Card className="w-full p-4 mx-4 bg-white border-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] rounded-3xl">
      <div className="flex flex-wrap items-center md:flex-row flex-col gap-8">
        <Image
          src="/login-illus.png"
          alt="Change Password Illustration"
          width={0}
          height={0}
          className="w-full lg:max-w-[524px] lg:max-h-full max-h-[136px] object-cover lg:object-contain rounded-lg"
        />
        <div className="space-y-6 flex-1 md:px-4">
          {/* Header */}
          <div className="flex justify-center items-center flex-col">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/lesprivate-logo.png"
                priority
                alt="LesPrivate Logo"
                width={214}
                height={62}
              />
            </Link>
            <h1 className="font-bold text-gray-900">Ubah Password</h1>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Password berhasil diubah! Mengarahkan ke halaman login...
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password Input */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 text-main-400 hover:text-main z-10"
                        >
                          {showNewPassword ? (
                            <EyeOpen fill={errors.newPassword ? "#FF0004" : "#7000FE"} />
                          ) : (
                            <EyeClosed fill={errors.newPassword ? "#FF0004" : "#7000FE"} />
                          )}
                        </button>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Password Baru"
                          {...field}
                          className={classNameInputPassword(!!errors.newPassword)}
                        />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              errors.newPassword ? "bg-red-500" : "bg-main"
                            }`}
                          >
                            <KeyIcon />
                          </div>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Confirm Password Input */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 text-main-400 hover:text-main z-10"
                        >
                          {showConfirmPassword ? (
                            <EyeOpen fill={errors.confirmPassword ? "#FF0004" : "#7000FE"} />
                          ) : (
                            <EyeClosed fill={errors.confirmPassword ? "#FF0004" : "#7000FE"} />
                          )}
                        </button>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Konfirmasi Password"
                          {...field}
                          className={classNameInputPassword(!!errors.confirmPassword)}
                        />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              errors.confirmPassword ? "bg-red-500" : "bg-main"
                            }`}
                          >
                            <KeyIcon />
                          </div>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex items-center justify-center mt-8">
                <Button
                  type="submit"
                  size="sm"
                  className="p-4 w-42 h-[40px] text-lg font-bold bg-main hover:bg-main"
                  disabled={isSubmitting || submitSuccess}
                >
                  {isSubmitting ? "Loading..." : "SAVE"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  )
}

// Main export component wrapped in Suspense
export function ChangePasswordForm() {
  return (
    <Suspense fallback={<ChangePasswordFormSkeleton />}>
      <ChangePasswordFormInternal />
    </Suspense>
  )
}
