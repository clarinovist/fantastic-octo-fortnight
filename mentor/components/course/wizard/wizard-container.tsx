"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "./schema"
import { CourseDetailSaved } from "@/utils/types/course"

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

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
            window.scrollTo({ top: 0, behavior: "smooth" })
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
