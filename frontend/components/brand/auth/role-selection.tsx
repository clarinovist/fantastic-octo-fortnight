"use client"

import { roleNameAction } from "@/actions/auth"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type IconProps = {
  className?: string
  fill?: string
}

const StudentIcon = (props: IconProps) => {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="16"
      viewBox="0 0 15 16"
      fill="none"
    >
      <path
        d="M7.4995 9.77734C10.0025 9.77734 14.9995 10.9599 15 13.333V16H0V13.333C0.000456404 10.96 4.99644 9.77745 7.4995 9.77734Z"
        fill={props.fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0622 3.11133V7.55566H13.1244V3.55566L11.1459 4.49707C11.2792 5.02006 11.2868 5.56611 11.1659 6.0918C11.0448 6.61743 10.7988 7.1105 10.4478 7.5332C10.0967 7.95584 9.64888 8.29739 9.13842 8.53223C8.62781 8.76704 8.067 8.88894 7.4995 8.88867C6.93221 8.8889 6.37202 8.76691 5.86158 8.53223C5.35119 8.29742 4.90325 7.95576 4.55223 7.5332C4.20118 7.1105 3.95521 6.61743 3.83414 6.0918C3.71315 5.56609 3.71976 5.02008 3.85312 4.49707L0.937812 3.11133L7.4995 0L14.0622 3.11133ZM5.12751 3.08398L7.56542 4.25781L10.0782 3.04004L7.65031 1.86621L5.12751 3.08398Z"
        fill={props.fill}
      />
    </svg>
  )
}

const TutorIcon = (props: IconProps) => {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M14.439 12.1665C14.853 12.1665 15.2501 12.005 15.5428 11.7174C15.8355 11.4298 16 11.0398 16 10.6332V2.19984C16 1.79317 15.8355 1.40316 15.5428 1.11561C15.2501 0.828051 14.853 0.666504 14.439 0.666504H6.21268C6.48585 1.13417 6.63415 1.66317 6.63415 2.19984H14.439V10.6332H7.41463V12.1665M10.5366 4.49984V6.03317H5.85366V15.9998H4.29268V11.3998H2.73171V15.9998H1.17073V9.8665H0V6.03317C0 5.62651 0.164459 5.2365 0.457199 4.94894C0.749939 4.66138 1.14698 4.49984 1.56098 4.49984H10.5366ZM5.07317 2.19984C5.07317 2.6065 4.90871 2.99651 4.61597 3.28407C4.32323 3.57162 3.92619 3.73317 3.5122 3.73317C3.0982 3.73317 2.70116 3.57162 2.40842 3.28407C2.11568 2.99651 1.95122 2.6065 1.95122 2.19984C1.95122 1.79317 2.11568 1.40316 2.40842 1.11561C2.70116 0.828051 3.0982 0.666504 3.5122 0.666504C3.92619 0.666504 4.32323 0.828051 4.61597 1.11561C4.90871 1.40316 5.07317 1.79317 5.07317 2.19984Z"
        fill={props.fill}
      />
    </svg>
  )
}

const CheckIcon = (props: IconProps) => {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        d="M3.28224 9.0767L0 5.81831L1.49577 4.33341L3.28224 6.11214L8.50423 0.922852L10 2.40775L3.28224 9.0767Z"
        fill={props.fill}
      />
    </svg>
  )
}

// Zod schema for form validation
const roleNameSchema = z.object({
  roleName: z.string().min(1, {
    message: "Role name wajib diisi",
  }),
})

type RoleNameValue = z.infer<typeof roleNameSchema>

export function RoleSection() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const lastSubmittedRole = useRef<string>("")

  const form = useForm<RoleNameValue>({
    resolver: zodResolver(roleNameSchema),
    defaultValues: {
      roleName: "",
    },
  })

  const {
    formState: { errors },
    watch,
  } = form

  // Watch for changes in roleName field
  const watchedRoleName = watch("roleName")

  const onSubmit = useCallback(
    async (values: RoleNameValue) => {
      if (isLoading) return // Prevent duplicate submissions

      setSubmitError("")
      setIsLoading(true)

      try {
        const formData = new FormData()
        formData.append("roleName", values.roleName)

        const response = await roleNameAction(formData)

        if (response.success) {
<<<<<<< HEAD
          router.replace("/")
=======
          if (values.roleName === "tutor") {
            const mentorUrl = process.env.NEXT_PUBLIC_MENTOR_URL || "/";
            window.location.href = mentorUrl;
          } else {
            router.replace("/");
          }
>>>>>>> 1a19ced (chore: update service folders from local)
        } else {
          setSubmitError(response.message || "Login failed. Please try again.")
        }
      } catch (error) {
        console.error("Login error:", error)
        setSubmitError("An unexpected error occurred. Please try again.")
      } finally {
        setIsLoading(false)
        lastSubmittedRole.current = values.roleName
      }
    },
<<<<<<< HEAD
    [router]
=======
    [router, isLoading]
>>>>>>> 1a19ced (chore: update service folders from local)
  )

  // Auto-submit when role is selected
  useEffect(() => {
    if (
      watchedRoleName &&
      watchedRoleName !== "" &&
      !isLoading &&
      lastSubmittedRole.current !== watchedRoleName
    ) {
      onSubmit({ roleName: watchedRoleName })
    }
<<<<<<< HEAD
  }, [watchedRoleName, isLoading])
=======
  }, [watchedRoleName, isLoading, onSubmit])
>>>>>>> 1a19ced (chore: update service folders from local)

  return (
    <Card className="w-full p-4 mx-4 bg-white border-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] rounded-3xl">
      <div className="flex flex-wrap items-center md:flex-row flex-col gap-8">
        <Image
          src="/login-illus.png"
          alt="Login Illustration"
          width={0}
          height={0}
          className="w-full lg:max-w-[450px] lg:max-h-full max-h-[136px] object-cover lg:object-contain rounded-lg"
        />
        <div className="space-y-6 flex-1 md:px-4">
          {/* Header */}
          <div className="flex justify-center items-center flex-col gap-2">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/lesprivate-logo.png"
                priority
                alt="LesPrivate Logo"
                width={214}
                height={62}
              />
            </Link>
            <h1 className="font-bold text-gray-900">Pilih Peran kamu sebelum melanjutkan</h1>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Input */}
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup {...field} onValueChange={field.onChange} className="flex gap-4">
                        {/* Teacher Option */}
                        <FormItem className="flex-1">
                          <div className="relative">
                            <FormLabel
                              htmlFor="tutor"
                              className={`cursor-pointer block ${isLoading ? "pointer-events-none" : ""}`}
                            >
                              <div
                                className={`relative flex items-center justify-between p-4 rounded-full border-2 transition-all duration-200
<<<<<<< HEAD
                                ${
                                  field.value === "tutor"
=======
                                ${field.value === "tutor"
>>>>>>> 1a19ced (chore: update service folders from local)
                                    ? "border-main bg-main"
                                    : errors.roleName
                                      ? "border-red-500"
                                      : "border-main/50 bg-white hover:border-main/50"
<<<<<<< HEAD
                                }
=======
                                  }
>>>>>>> 1a19ced (chore: update service folders from local)
                                ${isLoading ? "opacity-50" : ""}
                          `}
                              >
                                <div className="flex items-center gap-4">
                                  <TutorIcon
                                    fill={
                                      errors.roleName
                                        ? "#FF0004"
                                        : field.value === "tutor"
                                          ? "#FFFFFF"
                                          : "#7000FE"
                                    }
                                  />
                                  <span
                                    className={`font-medium ${field.value === "tutor" ? "text-white" : errors.roleName ? "text-red-500" : "text-purple-600"}`}
                                  >
                                    I&apos;m a Teacher
                                  </span>
                                </div>
                                <div className="w-4 h-4 flex items-center justify-center bg-white rounded-full">
                                  {isLoading && field.value === "tutor" ? (
                                    <div className="w-3 h-3 border-2 border-main border-t-transparent rounded-full animate-spin" />
                                  ) : field.value === "tutor" ? (
                                    <CheckIcon fill="#7000FE" />
                                  ) : (
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 ${errors.roleName ? "border-red-500" : "border-main/50"}`}
                                    />
                                  )}
                                </div>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <RadioGroupItem
                                value="tutor"
                                id="tutor"
                                className="sr-only"
                                disabled={isLoading}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                        {/* Student Option */}
                        <FormItem className="flex-1">
                          <div className="relative">
                            <FormLabel
                              htmlFor="student"
                              className={`cursor-pointer block ${isLoading ? "pointer-events-none" : ""}`}
                            >
                              <div
                                className={`
                            relative flex items-center justify-between p-4 rounded-full border-2 transition-all duration-200
<<<<<<< HEAD
                            ${
                              field.value === "student"
                                ? "border-main bg-main"
                                : errors.roleName
                                  ? "border-red-500"
                                  : "border-main/50 bg-white hover:border-main/50"
                            }
=======
                            ${field.value === "student"
                                    ? "border-main bg-main"
                                    : errors.roleName
                                      ? "border-red-500"
                                      : "border-main/50 bg-white hover:border-main/50"
                                  }
>>>>>>> 1a19ced (chore: update service folders from local)
                            ${isLoading ? "opacity-50" : ""}
                          `}
                              >
                                <div className="flex items-center gap-4">
                                  <StudentIcon
                                    fill={
                                      errors.roleName
                                        ? "#FF0004"
                                        : field.value === "student"
                                          ? "#FFFFFF"
                                          : "#7000FE"
                                    }
                                  />
                                  <span
                                    className={`font-medium ${field.value === "student" ? "text-white" : errors.roleName ? "text-red-500" : "text-purple-600"}`}
                                  >
                                    I&apos;m a Student
                                  </span>
                                </div>
                                <div className="w-4 h-4 flex items-center justify-center">
                                  {isLoading && field.value === "student" ? (
                                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                      <div className="w-3 h-3 border-2 border-main border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  ) : field.value === "student" ? (
                                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                      <CheckIcon fill="#7000FE" />
                                    </div>
                                  ) : (
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 ${errors.roleName ? "border-red-500" : "border-main/50"}`}
                                    />
                                  )}
                                </div>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <RadioGroupItem
                                value="student"
                                id="student"
                                className="sr-only"
                                disabled={isLoading}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </Card>
  )
}
