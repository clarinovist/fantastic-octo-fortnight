"use client"

import { useWizard } from "./wizard-container"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function WizardStepper() {
    const { currentStep, setCurrentStep } = useWizard()
    const steps = ["Audiens", "Tentang", "Harga", "Jadwal", "Preview"]

    return (
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-12">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentStep
                const isActive = idx === currentStep

                return (
                    <div key={idx} className="flex items-center flex-1 last:flex-none">
                        <button
                            type="button"
                            onClick={() => idx < currentStep && setCurrentStep(idx)}
                            disabled={idx > currentStep}
                            className="flex flex-col items-center gap-2 group outline-none"
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                    isActive ? "border-primary text-primary ring-4 ring-primary/10" :
                                        "border-muted text-muted-foreground"
                            )}>
                                {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-all whitespace-nowrap",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {step}
                            </span>
                        </button>

                        {idx < steps.length - 1 && (
                            <div className={cn(
                                "h-[2px] w-full mx-4 transition-all",
                                idx < currentStep ? "bg-primary" : "bg-muted"
                            )} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
