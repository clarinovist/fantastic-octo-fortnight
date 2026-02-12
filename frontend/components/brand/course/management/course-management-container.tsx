"use client"

import { Toaster } from "@/components/ui/sonner"
import { clientFetchRaw } from "@/services/client"
import { CourseCreateResponse, CourseDetailSaved } from "@/utils/types"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { Logo } from "../../logo"
import { TopStepper } from "./top-stepper"

interface StepContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  validateAndMoveToStep: (targetStep: number) => boolean
  formRef: React.RefObject<HTMLFormElement> | null
  setFormRef: (ref: React.RefObject<HTMLFormElement>) => void
  formInstance: UseFormReturn<any> | null
  setFormInstance: (form: UseFormReturn<any>) => void
  handleSubmit: () => void
  isSubmitting: boolean
  schedulesOnline: any[]
  setSchedulesOnline: (schedules: any[]) => void
  schedulesOffline: any[]
  setSchedulesOffline: (schedules: any[]) => void
  allStepsValid: boolean
  detail?: CourseDetailSaved
  navigateToSection: (section: "audience" | "about" | "pricing" | "schedule") => void
}

const StepContext = createContext<StepContextType | undefined>(undefined)

export const useStep = () => {
  const context = useContext(StepContext)
  if (!context) {
    throw new Error(
      "useStep must be used within CourseManagementContainer. Make sure ManagementForm is wrapped inside CourseManagementContainer."
    )
  }
  return context
}

interface CourseManagementLayoutProps {
  children: React.ReactNode
  detail?: CourseDetailSaved
}

export function CourseManagementContainer({ children, detail }: CourseManagementLayoutProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formRef, setFormRef] = useState<React.RefObject<HTMLFormElement> | null>(null)
  const [formInstance, setFormInstance] = useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Schedule states from the form
  const [schedulesOnline, setSchedulesOnline] = useState<any[]>([])
  const [schedulesOffline, setSchedulesOffline] = useState<any[]>([])
  const [allStepsValid, setAllStepsValid] = useState(false)

  // Helper function to convert Indonesian day names to numeric values
  const convertDayToNumber = (dayName: string): string => {
    const dayMap: Record<string, string> = {
      Senin: "1",
      Selasa: "2",
      Rabu: "3",
      Kamis: "4",
      Jumat: "5",
      Sabtu: "6",
      Minggu: "7",
    }
    return dayMap[dayName] || dayName
  }

  const navigateToSection = (section: "audience" | "about" | "pricing" | "schedule") => {
    const sectionIds = {
      audience: "audience-top",
      about: "about-top",
      pricing: "pricing-top",
      schedule: "schedule-top",
    }

    const targetSection = document.getElementById(sectionIds[section])
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const validateStep = (step: number): boolean => {
    if (!formInstance) return false

    const formValues = formInstance.getValues()

    switch (step) {
      case 0: // Audience section
        const levelEducationValid = formValues.levelEducationCourses?.length > 0
        const courseCategoryValid =
          formValues.courseCategoryID && formValues.courseCategoryID.trim() !== ""
        const subCategoryValid = formValues.subCategoryIDs?.length > 0
        const isAudienceValid = levelEducationValid && courseCategoryValid && subCategoryValid
        return isAudienceValid

      case 1: // About section
        const titleValid = formValues.title && formValues.title.trim() !== ""
        const descriptionValid = formValues.description && formValues.description.trim() !== ""
        const tutorDescriptionValid =
          formValues.tutorDescription && formValues.tutorDescription.trim() !== ""
        const isAboutValid = titleValid && descriptionValid && tutorDescriptionValid
        return isAboutValid

      case 2: // Pricing section
        const classTypeValid =
          formValues.classType?.length > 0 && !formValues.classType.includes("all")

        let priceValid = false

        // Check if both online and offline are selected
        const hasOnline = formValues.classType?.includes("Online")
        const hasOffline = formValues.classType?.includes("Offline")

        if (hasOnline && hasOffline) {
          // Both selected - both prices must be > 0
          priceValid = formValues.oneHourOnlinePrice > 0 && formValues.oneHourOfflinePrice > 0
        } else if (hasOnline) {
          // Only online selected
          priceValid = formValues.oneHourOnlinePrice > 0
        } else if (hasOffline) {
          // Only offline selected
          priceValid = formValues.oneHourOfflinePrice > 0
        }

        // If online is selected, check if at least one online channel is selected
        let onlineChannelValid = true
        if (formValues.classType?.includes("Online")) {
          onlineChannelValid = formValues.onlineChannel?.length > 0
        }

        const isPricingValid = classTypeValid && priceValid && onlineChannelValid

        return isPricingValid

      case 3: // Schedule section
        // Check if at least one schedule is selected for the chosen class types
        const selectedClassTypes = formValues.classType || []
        let scheduleValid = false

        // If offline is selected, check if at least one offline schedule is set
        if (selectedClassTypes.includes("Offline")) {
          const offlineSchedules = formValues.courseSchedulesOffline || {}
          const hasOfflineSchedule = Object.values(offlineSchedules).some(
            (daySchedules: any) =>
              Array.isArray(daySchedules) &&
              daySchedules.some(
                (schedule: any) =>
                  schedule.startTime &&
                  schedule.startTime.trim() !== "" &&
                  schedule.timezone &&
                  schedule.timezone.trim() !== ""
              )
          )
          if (hasOfflineSchedule) scheduleValid = true
        }

        // If online is selected, check if at least one online schedule is set
        if (selectedClassTypes.includes("Online")) {
          const onlineSchedules = formValues.courseSchedulesOnline || {}
          const hasOnlineSchedule = Object.values(onlineSchedules).some(
            (daySchedules: any) =>
              Array.isArray(daySchedules) &&
              daySchedules.some(
                (schedule: any) =>
                  schedule.startTime &&
                  schedule.startTime.trim() !== "" &&
                  schedule.timezone &&
                  schedule.timezone.trim() !== ""
              )
          )
          if (hasOnlineSchedule) scheduleValid = true
        }

        // If both are selected, at least one should have schedules
        if (selectedClassTypes.includes("Online") && selectedClassTypes.includes("Offline")) {
          const offlineSchedules = formValues.courseSchedulesOffline || {}
          const onlineSchedules = formValues.courseSchedulesOnline || {}

          const hasOfflineSchedule = Object.values(offlineSchedules).some(
            (daySchedules: any) =>
              Array.isArray(daySchedules) &&
              daySchedules.some(
                (schedule: any) =>
                  schedule.startTime &&
                  schedule.startTime.trim() !== "" &&
                  schedule.timezone &&
                  schedule.timezone.trim() !== ""
              )
          )

          const hasOnlineSchedule = Object.values(onlineSchedules).some(
            (daySchedules: any) =>
              Array.isArray(daySchedules) &&
              daySchedules.some(
                (schedule: any) =>
                  schedule.startTime &&
                  schedule.startTime.trim() !== "" &&
                  schedule.timezone &&
                  schedule.timezone.trim() !== ""
              )
          )

          scheduleValid = hasOfflineSchedule || hasOnlineSchedule
        }

        return scheduleValid

      default:
        return false
    }
  }

  const validateAndMoveToStep = (targetStep: number): boolean => {
    // Validate all steps up to the target step
    for (let i = 0; i < targetStep; i++) {
      if (!validateStep(i)) {
        return false
      }
    }
    setCurrentStep(targetStep)

    // Scroll to the target section
    const sectionIds = ["audience", "about", "pricing", "schedule"]
    const targetSection = document.getElementById(sectionIds[targetStep])
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return true
  }

  const handleSubmit = async () => {
    if (!formInstance || isSubmitting || !allStepsValid) return

    setIsSubmitting(true)

    try {
      // Get form values and prepare API payload
      const formValues = formInstance.getValues()

      // Transform classType if both online and offline are selected
      let transformedClassType = formValues.classType
      if (formValues.classType?.includes("Online") && formValues.classType?.includes("Offline")) {
        transformedClassType = ["all"]
      }

      // Filter out pricing entries with price 0
      const filteredCoursePrices = {
        online: formValues.coursePrices?.online?.filter((price: any) => price.price > 0) || [],
        offline: formValues.coursePrices?.offline?.filter((price: any) => price.price > 0) || [],
      }

      // Clean up courseSchedules by removing empty objects and convert day names to numbers
      const cleanSchedules = (
        schedules: Record<string, Array<{ startTime: string; timezone: string }>>
      ) => {
        const cleaned: Record<string, Array<{ startTime: string; timezone: string }>> = {}

        Object.entries(schedules).forEach(([day, daySchedules]) => {
          const validSchedules = daySchedules
            .filter(
              schedule =>
                schedule.startTime &&
                schedule.startTime.trim() !== "" &&
                schedule.timezone &&
                schedule.timezone.trim() !== ""
            )
            .map(schedule => ({
              ...schedule,
              // Add :00 seconds to startTime if not already present
              startTime:
                schedule.startTime.includes(":") && schedule.startTime.split(":").length === 2
                  ? `${schedule.startTime}:00`
                  : schedule.startTime,
            }))

          if (validSchedules.length > 0) {
            // Convert day name to number for API
            const dayNumber = convertDayToNumber(day)
            cleaned[dayNumber] = validSchedules
          }
        })

        return cleaned
      }

      const cleanedOnlineSchedules = cleanSchedules(formValues.courseSchedulesOnline || {})
      const cleanedOfflineSchedules = cleanSchedules(formValues.courseSchedulesOffline || {})

      // Prepare final API data
      const { oneHourOnlinePrice, oneHourOfflinePrice, ...apiData } = formValues

      const finalApiData = {
        ...apiData,
        classType: transformedClassType[0].toLowerCase(), // API expects a single value: 'online', 'offline', or 'all'
        coursePrices: filteredCoursePrices,
        courseSchedulesOnline: cleanedOnlineSchedules,
        courseSchedulesOffline: cleanedOfflineSchedules,
      }

      // Determine if this is an update or create
      const isUpdate = !!detail?.id
      const apiEndpoint = isUpdate
        ? `/api/v1/tutors/courses/${detail.id}`
        : "/api/v1/tutors/courses"
      const method = isUpdate ? "PUT" : "POST"

      // Make API call
      const response = await clientFetchRaw<{
        data: CourseCreateResponse
        message: string
        success: boolean
      }>(apiEndpoint, {
        method,
        body: JSON.stringify(finalApiData),
      })

      if (!response.success) {
        toast.error(response.message || "Failed to create course. Please try again.")
        return
      }

      // You can add success notification here
      toast.success("Course created successfully!")

      // Optionally redirect or reset form
      router.push(`/account/course/${response.data.id}/preview`)
    } catch (error) {
      const err = error as unknown as { message?: string }

      // Handle error
      toast.error(err.message || "Failed to create course. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if all steps are valid
  useEffect(() => {
    if (!formInstance) {
      setAllStepsValid(false)
      return
    }

    const checkAllSteps = () => {
      const allValid = [0, 1, 2, 3].every(step => validateStep(step))
      setAllStepsValid(allValid)
    }

    // Subscribe to form changes
    const subscription = formInstance.watch(() => {
      checkAllSteps()
    })

    // Initial check
    checkAllSteps()

    return () => subscription.unsubscribe()
  }, [formInstance, schedulesOnline, schedulesOffline])

  // Auto-update current step based on form validation
  useEffect(() => {
    if (!formInstance) return

    const checkCurrentStep = () => {
      let newStep = 0
      for (let i = 0; i < 4; i++) {
        if (validateStep(i)) {
          newStep = i + 1
        } else {
          break
        }
      }
      // Cap the step at the maximum step index (3) to keep mascot visible
      const cappedStep = Math.min(newStep, 3)
      if (cappedStep !== currentStep) {
        setCurrentStep(cappedStep)
      }
    }

    // Subscribe to form changes
    const subscription = formInstance.watch(() => {
      checkCurrentStep()
    })

    // Initial check
    checkCurrentStep()

    return () => subscription.unsubscribe()
  }, [formInstance, currentStep, schedulesOnline, schedulesOffline])

  const stepContextValue: StepContextType = {
    currentStep,
    setCurrentStep,
    validateAndMoveToStep,
    formRef,
    setFormRef,
    formInstance,
    setFormInstance,
    handleSubmit,
    isSubmitting,
    schedulesOnline,
    setSchedulesOnline,
    schedulesOffline,
    setSchedulesOffline,
    allStepsValid,
    detail,
    navigateToSection,
  }

  return (
    <StepContext.Provider value={stepContextValue}>
      <div className="w-full flex flex-col">
        <div className="flex items-start gap-16 lg:p-12 p-4 sticky top-0 bg-white z-20">
          <Logo type="full" isSpecificSize width={191} height={56} className="xl:block hidden" />
          <div className="w-full">
            <TopStepper
              steps={[
                "Tingkat dan Subjek/mata pelajaran",
                "Tentang Course dan Tutor",
                "Tipe kelas dan Harga",
                "Jadwal tersedia",
              ]}
              currentStep={currentStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isDisabled={!allStepsValid}
            />
          </div>
        </div>

        {children}
        <Toaster richColors />
      </div>
    </StepContext.Provider>
  )
}
