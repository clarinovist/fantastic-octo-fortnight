"use client"

import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUserProfile } from "@/context/user-profile"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ForgotPasswordDialog } from "./forgot-password-dialog"

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

const Mail = ({ className, fill = "white" }: IconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
    >
      <path
        d="M20.4 0H3.6C2.64522 0 1.72955 0.395088 1.05442 1.09835C0.379285 1.80161 0 2.75544 0 3.75V16.25C0 17.2446 0.379285 18.1984 1.05442 18.9017C1.72955 19.6049 2.64522 20 3.6 20H20.4C21.3548 20 22.2705 19.6049 22.9456 18.9017C23.6207 18.1984 24 17.2446 24 16.25V3.75C24 2.75544 23.6207 1.80161 22.9456 1.09835C22.2705 0.395088 21.3548 0 20.4 0ZM20.4 2.5L12.6 8.0875C12.4176 8.19721 12.2106 8.25497 12 8.25497C11.7894 8.25497 11.5824 8.19721 11.4 8.0875L3.6 2.5H20.4Z"
        fill={fill}
      />
    </svg>
  )
}

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(1, {
    message: "Password wajib diisi",
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const userContext = useUserProfile()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    formState: { errors },
  } = form

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)

      const response = await loginAction(formData)

      if (response.success) {
        // Refetch profile after successful login
        await userContext?.refetchProfile()

        // Check for target_path cookie
        const targetPath = document.cookie
          .split("; ")
          .find(row => row.startsWith("target_path="))
          ?.split("=")[1]

        if (targetPath) {
          // Clear the cookie
          document.cookie = "target_path=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          router.push(decodeURIComponent(targetPath))
        } else {
          router.push("/")
        }
      } else {
        setSubmitError(response.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setSubmitError("")

    try {
      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/auth/callback?state=login`,
        redirect: false,
      })

      if (result?.error) {
        setSubmitError("Google login failed. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url + "&state=login"
      }
    } catch (error) {
      console.error("Google login error:", error)
      setSubmitError("An unexpected error occurred with Google login.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const classNameInput = (isError: boolean) => {
    return `focus-visible:border-main focus-visible:ring-0 border-2 pl-16 pr-4 py-6 text-lg rounded-full placeholder:text-main-300 ${
      isError
        ? "focus-visible:border-red-500 border-red-500 placeholder:opacity-75 placeholder:text-[#FF000440]"
        : "border-main/50"
    }`
  }

  const classNameInputPassword = (isError: boolean) => {
    return `focus-visible:border-main focus-visible:ring-0 border-2 pl-16 pr-16 py-6 text-lg rounded-full placeholder:text-main-300 ${
      isError
        ? "focus-visible:border-red-500 border-red-500 placeholder:opacity-75 placeholder:text-[#FF000440]"
        : "border-main/50"
    }`
  }

  return (
    <>
      <Card className="w-full p-4 mx-4 bg-white border-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] rounded-3xl">
        <div className="flex flex-wrap items-center md:flex-row flex-col gap-8">
          <Image
            src="/login-illus.png"
            alt="Login Illustration"
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
              <h1 className="font-bold text-gray-900">Log In</h1>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Input */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                errors.email ? "bg-red-500" : "bg-main"
                              }`}
                            >
                              <Mail />
                            </div>
                          </div>
                          <Input
                            type="email"
                            placeholder="Email"
                            {...field}
                            className={classNameInput(!!errors.email)}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div>
                  {/* Password Input */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 text-main-400 hover:text-main"
                            >
                              {showPassword ? (
                                <EyeOpen fill={errors.password ? "#FF0004" : "#7000FE"} />
                              ) : (
                                <EyeClosed fill={errors.password ? "#FF0004" : "#7000FE"} />
                              )}
                            </button>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              {...field}
                              className={classNameInputPassword(!!errors.password)}
                            />

                            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  errors.password ? "bg-red-500" : "bg-main"
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
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-sm text-main underline font-medium hover:text-main-700 cursor-pointer mt-2"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button and Google Sign In */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  {/* Google Sign In Button */}
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    variant="outline"
                    className="w-[40px] h-[40px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 p-0"
                  >
                    {isGoogleLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_649_4761)">
                          <path
                            d="M8.36104 0.789433C5.96307 1.62131 3.89506 3.20024 2.46077 5.29431C1.02649 7.38838 0.301526 9.8872 0.392371 12.4237C0.483217 14.9603 1.38508 17.4008 2.9655 19.3869C4.54591 21.373 6.72158 22.8 9.17292 23.4582C11.1603 23.971 13.2424 23.9935 15.2404 23.5238C17.0504 23.1173 18.7238 22.2476 20.0967 21.0001C21.5256 19.662 22.5627 17.9597 23.0967 16.0763C23.677 14.0282 23.7803 11.8743 23.3985 9.78006H12.2385V14.4094H18.7017C18.5725 15.1478 18.2957 15.8525 17.8878 16.4814C17.48 17.1102 16.9494 17.6504 16.3279 18.0694C15.5387 18.5915 14.649 18.9428 13.716 19.1007C12.7803 19.2747 11.8205 19.2747 10.8848 19.1007C9.9364 18.9046 9.03923 18.5132 8.25042 17.9513C6.9832 17.0543 6.03168 15.7799 5.53167 14.3101C5.02319 12.8127 5.02319 11.1893 5.53167 9.69193C5.88759 8.64234 6.47598 7.68669 7.25292 6.89631C8.14203 5.97521 9.26766 5.3168 10.5063 4.99333C11.745 4.66985 13.0488 4.6938 14.2748 5.06256C15.2325 5.35654 16.1083 5.87019 16.8323 6.56256C17.561 5.83756 18.2885 5.11068 19.0148 4.38193C19.3898 3.99006 19.7985 3.61693 20.1679 3.21568C19.0627 2.1872 17.7654 1.38691 16.3504 0.860683C13.7736 -0.0749616 10.9541 -0.100106 8.36104 0.789433Z"
                            fill="white"
                          />
                          <path
                            d="M8.3607 0.789367C10.9536 -0.100776 13.7731 -0.0762934 16.3501 0.858742C17.7654 1.38855 19.062 2.19269 20.1657 3.22499C19.7907 3.62624 19.3951 4.00124 19.0126 4.39124C18.2851 5.11749 17.5582 5.84124 16.832 6.56249C16.1079 5.87012 15.2321 5.35648 14.2745 5.06249C13.0489 4.69244 11.7451 4.66711 10.5061 4.98926C9.26712 5.31141 8.14079 5.96861 7.2507 6.88874C6.47377 7.67912 5.88538 8.63477 5.52945 9.68437L1.64258 6.67499C3.03384 3.91604 5.44273 1.80566 8.3607 0.789367Z"
                            fill="#E33629"
                          />
                          <path
                            d="M0.611401 9.6563C0.820316 8.62091 1.16716 7.61822 1.64265 6.67505L5.52953 9.69192C5.02105 11.1893 5.02105 12.8127 5.52953 14.31C4.23453 15.31 2.9389 16.315 1.64265 17.325C0.452308 14.9556 0.0892746 12.256 0.611401 9.6563Z"
                            fill="#F8BD00"
                          />
                          <path
                            d="M12.2381 9.77808H23.3981C23.7799 11.8723 23.6766 14.0262 23.0963 16.0743C22.5623 17.9577 21.5252 19.66 20.0963 20.9981C18.8419 20.0193 17.5819 19.0481 16.3275 18.0693C16.9494 17.6498 17.4802 17.1091 17.8881 16.4796C18.296 15.85 18.5726 15.1446 18.7013 14.4056H12.2381C12.2363 12.8643 12.2381 11.3212 12.2381 9.77808Z"
                            fill="#587DBD"
                          />
                          <path
                            d="M1.64062 17.3251C2.93687 16.3251 4.2325 15.3201 5.5275 14.3101C6.02851 15.7804 6.98138 17.0549 8.25 17.9513C9.04127 18.5106 9.94037 18.8988 10.89 19.0913C11.8257 19.2653 12.7855 19.2653 13.7213 19.0913C14.6542 18.9334 15.5439 18.5821 16.3331 18.0601C17.5875 19.0388 18.8475 20.0101 20.1019 20.9888C18.7292 22.237 17.0558 23.1073 15.2456 23.5144C13.2476 23.9841 11.1655 23.9616 9.17813 23.4488C7.60632 23.0291 6.13814 22.2893 4.86563 21.2757C3.51874 20.2063 2.41867 18.8588 1.64062 17.3251Z"
                            fill="#319F43"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_649_4761">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    )}
                  </Button>

                  {/* Main Login Button */}
                  <Button
                    type="submit"
                    size="sm"
                    className="p-4 w-42 h-[40px] text-lg font-bold bg-main hover:bg-main"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "LOGGING IN..." : "LOG IN"}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-700">
                Belum punya akun?{" "}
                <Link href="/signup">
                  <button className="text-main underline font-medium hover:text-main-700 cursor-pointer">
                    Daftar sekarang
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  )
}
