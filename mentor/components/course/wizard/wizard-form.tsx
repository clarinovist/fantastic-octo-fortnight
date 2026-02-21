"use client"

import { useWizard } from "./wizard-container"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { StepAudiens } from "./steps/step-audiens"
import { StepTentang } from "./steps/step-tentang"
import { StepHarga } from "./steps/step-harga"
import { StepJadwal } from "./steps/step-jadwal"
import { WizardPreview } from "./wizard-preview"
import { toast } from "sonner"
import { createCourseAction, updateCourseAction } from "@/actions/course"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { wizardFormSchema, CourseWizardData } from "./schema"
import { CoursePayload } from "@/utils/types/course"

export function WizardForm() {
    const { currentStep, nextStep, prevStep, setFormInstance, detail, setIsSubmitting, isSubmitting } = useWizard()
    const router = useRouter()

    const form = useForm<CourseWizardData>({
        resolver: zodResolver(wizardFormSchema),
        defaultValues: detail ? {
            ...detail,
            classType: detail.classType === "all" ? ["Online", "Offline"] : [detail.classType === "online" ? "Online" : "Offline"],
            oneHourOnlinePrice: parseInt(detail.coursePrices.online?.find(p => p.durationInHour === 1)?.price.replace(/\D/g, '') || "0"),
            oneHourOfflinePrice: parseInt(detail.coursePrices.offline?.find(p => p.durationInHour === 1)?.price.replace(/\D/g, '') || "0"),
            coursePrices: {
                online: detail.coursePrices.online.map(p => ({ ...p, price: parseInt(p.price.replace(/\D/g, '')) })),
                offline: detail.coursePrices.offline.map(p => ({ ...p, price: parseInt(p.price.replace(/\D/g, '')) })),
            }
        } as unknown as CourseWizardData : {
            classType: [],
            courseCategoryID: "",
            coursePrices: { offline: [], online: [] },
            courseSchedulesOffline: {},
            courseSchedulesOnline: {},
            description: "",
            isFreeFirstCourse: true,
            levelEducationCourses: [],
            onlineChannel: [],
            subCategoryIDs: [],
            title: "",
            tutorDescription: "",
            oneHourOnlinePrice: 0,
            oneHourOfflinePrice: 0,
        }
    })

    useEffect(() => {
        setFormInstance(form)
    }, [form, setFormInstance])

    const getDayIndex = (day: string) => {
        const days: Record<string, string> = {
            "Senin": "1",
            "Selasa": "2",
            "Rabu": "3",
            "Kamis": "4",
            "Jumat": "5",
            "Sabtu": "6",
            "Minggu": "7"
        };
        return days[day] || "1";
    };

    const onSubmit = async (values: CourseWizardData) => {
        setIsSubmitting(true)
        try {
            // Transform schedules helper for payload
            const transformSchedulesForPayload = (
                schedules: Record<string, { startTime: string; timezone: string }[]> | undefined,
                classType: "online" | "offline" | "all"
            ) => {
                if (!schedules) return {};
                const transformed: Record<string, any[]> = {};
                Object.entries(schedules).forEach(([dayName, timeSlots]) => {
                    const validTimeSlots = timeSlots.filter(slot => slot.startTime && slot.startTime.trim() !== "");
                    if (validTimeSlots.length > 0) {
                        const dayIndex = getDayIndex(dayName);
                        transformed[dayIndex] = validTimeSlots.map(slot => ({
                            startTime: slot.startTime.includes(":") && slot.startTime.split(":").length === 2 ? `${slot.startTime}:00` : slot.startTime,
                            timezone: slot.timezone,
                            classType: classType,
                        }));
                    }
                });
                return transformed;
            };

            const computedClassType = values.classType.length === 2 ? "all" : values.classType[0].toLowerCase();
            const payload = {
                ...values,
                classType: computedClassType,
                courseSchedulesOnline: transformSchedulesForPayload(values.courseSchedulesOnline, computedClassType as any),
                courseSchedulesOffline: transformSchedulesForPayload(values.courseSchedulesOffline, computedClassType as any),
            }

            const res = detail?.id
                ? await updateCourseAction(detail.id, payload as CoursePayload)
                : await createCourseAction(payload as CoursePayload)

            if (res.success) {
                toast.success("Kelas berhasil disimpan")
                router.push("/courses")
            } else {
                toast.error(`Gagal menyimpan kelas: ${(res as any).message || (res as any).error || "Unknown Error"}`)
                console.error("API Error Response:", res)
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan sistem: ${error instanceof Error ? error.message : "Unknown error"}`)
            console.error("System Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <StepAudiens form={form} />
            case 1: return <StepTentang form={form} />
            case 2: return <StepHarga form={form} />
            case 3: return <StepJadwal form={form} />
            case 4: return <WizardPreview form={form} />
            default: return null
        }
    }

    return (
        <div className="max-w-4xl mx-auto w-full pb-20">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(
                        (data) => onSubmit(data),
                        (errors) => {
                            const firstErrorField = Object.keys(errors)[0];
                            const firstErrorMessage = errors[firstErrorField as keyof typeof errors]?.message;
                            if (firstErrorMessage) {
                                toast.error(`Validation error: ${String(firstErrorMessage)}`);
                            } else {
                                toast.error("Please fill in all required fields correctly.");
                            }
                            console.error("Form validation errors:", errors);
                        }
                    )}
                    className="space-y-8"
                >
                    {renderStep()}

                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-30 lg:left-72">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 0 || isSubmitting}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>

                            <div className="flex items-center gap-3">
                                {currentStep < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-primary hover:bg-primary/90"
                                        disabled={isSubmitting}
                                    >
                                        Selanjutnya
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="bg-primary hover:bg-primary/90"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Menyimpan..." : "Simpan & Publikasikan"}
                                        <Save className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
