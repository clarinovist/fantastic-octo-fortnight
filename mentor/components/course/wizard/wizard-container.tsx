"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "./schema"
import { CourseDetailSaved } from "@/utils/types/course"
import useSWR from "swr"
import { getProfile } from "@/services/auth"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WizardContextType {
    currentStep: number
    setCurrentStep: (step: number) => void
    formInstance: UseFormReturn<CourseWizardData> | null
    setFormInstance: (form: UseFormReturn<CourseWizardData>) => void
    isSubmitting: boolean
    setIsSubmitting: (loading: boolean) => void
    allStepsValid: boolean
    detail?: CourseDetailSaved
    nextStep: () => void
    prevStep: () => void
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export const useWizard = () => {
    const context = useContext(WizardContext)
    if (!context) {
        throw new Error("useWizard must be used within WizardContainer")
    }
    return context
}

interface WizardContainerProps {
    children: React.ReactNode
    detail?: CourseDetailSaved
}

export function WizardContainer({ children, detail }: WizardContainerProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [formInstance, setFormInstance] = useState<UseFormReturn<CourseWizardData> | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [allStepsValid, setAllStepsValid] = useState(false)

    // Check profile
    const { data: profileRes, isLoading: isLoadingProfile, error: profileError } = useSWR("/v1/me", getProfile)

    const steps = ["Audiens", "Tentang", "Harga", "Jadwal", "Preview"]

    const validateStep = useCallback((step: number): boolean => {
        if (!formInstance) return false
        const values = formInstance.getValues()

        switch (step) {
            case 0: // Audiens
                return (
                    (values.levelEducationCourses?.length || 0) > 0 &&
                    !!values.courseCategoryID &&
                    (values.subCategoryIDs?.length || 0) > 0
                )
            case 1: // Tentang
                return (
                    !!values.title?.trim() &&
                    !!values.description?.trim() &&
                    !!values.tutorDescription?.trim()
                )
            case 2: // Harga
                const hasOnline = values.classType?.includes("Online")
                const hasOffline = values.classType?.includes("Offline")
                const priceValid = hasOnline || hasOffline
                    ? (hasOnline ? (values.oneHourOnlinePrice || 0) > 0 : true) &&
                    (hasOffline ? (values.oneHourOfflinePrice || 0) > 0 : true)
                    : false
                const channelValid = hasOnline ? (values.onlineChannel?.length || 0) > 0 : true
                return !!values.classType?.length && priceValid && channelValid
            case 3: // Jadwal
                const hasOnlineSchedule = Object.values(values.courseSchedulesOnline || {}).some(
                    (days) => (days as { startTime: string; timezone: string }[])?.length > 0
                )
                const hasOfflineSchedule = Object.values(values.courseSchedulesOffline || {}).some(
                    (days) => (days as { startTime: string; timezone: string }[])?.length > 0
                )
                return hasOnlineSchedule || hasOfflineSchedule
            case 4: // Preview
                return true
            default:
                return false
        }
    }, [formInstance])

    const nextStep = async () => {
        if (!formInstance) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fieldsToValidate: any[] = [];
        switch (currentStep) {
            case 0: fieldsToValidate = ["levelEducationCourses", "courseCategoryID", "subCategoryIDs"]; break;
            case 1: fieldsToValidate = ["title", "description", "tutorDescription"]; break;
            case 2: fieldsToValidate = ["classType", "coursePrices", "onlineChannel", "oneHourOnlinePrice", "oneHourOfflinePrice"]; break;
            case 3: fieldsToValidate = ["courseSchedulesOnline", "courseSchedulesOffline"]; break;
        }

        const isRHFValid = await formInstance.trigger(fieldsToValidate);
        const isManualValid = validateStep(currentStep);

        if (isManualValid && isRHFValid && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
            window.scrollTo({ top: 0, behavior: "smooth" })
        } else {
            // Include toast from sonner
            import("sonner").then(({ toast }) => {
                toast.error("Mohon lengkapi semua isian yang kosong atau salah pada langkah ini.");
            });
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    useEffect(() => {
        if (!formInstance) return
        const subs = formInstance.watch(() => {
            const valid = [0, 1, 2, 3].every(s => validateStep(s))
            setAllStepsValid(valid)
        })
        return () => subs.unsubscribe()
    }, [formInstance, validateStep])

    if (isLoadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-4">Memuat data...</p>
            </div>
        )
    }

    // Check if profile fails to load or not found
    if (profileError || !profileRes?.success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-6">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Profil Tutor Belum Lengkap</h2>
                    <p className="text-muted-foreground">
                        Anda harus melengkapi profil biodata Anda terlebih dahulu sebelum dapat membuat kelas baru.
                    </p>
                </div>
                <Button asChild className="mt-4">
                    <Link href="/profile">
                        Lengkapi Profil Saya
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <WizardContext.Provider value={{
            currentStep,
            setCurrentStep,
            formInstance,
            setFormInstance,
            isSubmitting,
            setIsSubmitting,
            allStepsValid,
            detail,
            nextStep,
            prevStep
        }}>
            {children}
        </WizardContext.Provider>
    )
}
