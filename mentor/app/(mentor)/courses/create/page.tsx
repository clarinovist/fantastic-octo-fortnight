import { WizardContainer } from "@/components/course/wizard/wizard-container"
import { WizardStepper } from "@/components/course/wizard/wizard-stepper"
import { WizardForm } from "@/components/course/wizard/wizard-form"

export default function CreateCoursePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <WizardContainer>
                <WizardStepper />
                <WizardForm />
            </WizardContainer>
        </div>
    )
}
