import { WizardContainer } from "@/components/course/wizard/wizard-container"
import { WizardStepper } from "@/components/course/wizard/wizard-stepper"
import { WizardForm } from "@/components/course/wizard/wizard-form"
import { getCourseSaved } from "@/services/course"
import { notFound } from "next/navigation"

interface EditCoursePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
    const { id } = await params
    const res = await getCourseSaved(id)

    if (!res.success || !res.data) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <WizardContainer detail={res.data}>
                <WizardStepper />
                <WizardForm />
            </WizardContainer>
        </div>
    )
}
