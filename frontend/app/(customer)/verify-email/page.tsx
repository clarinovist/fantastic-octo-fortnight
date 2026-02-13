"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail, resendVerification } from "@/services/auth"
import Image from "next/image"
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Send } from "lucide-react"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Verifying your email...")
    const [isResending, setIsResending] = useState(false)

    const handleResend = async () => {
        const emailParam = searchParams.get("email")
        if (!emailParam) {
            setMessage("Cannot resend: Email address not provided in link. Please try signing up again.")
            return
        }

        setIsResending(true)
        try {
            const response = await resendVerification(emailParam)
            if (response.success) {
                setMessage("Verification email has been resent to your inbox.")
            } else {
                setMessage(response.message || "Failed to resend verification email.")
            }
        } catch (error) {
            setMessage("An error occurred while resending the email.")
        } finally {
            setIsResending(false)
        }
    }

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Invalid verification link. Token is missing.")
            return
        }

        const performVerification = async () => {
            try {
                const response = await verifyEmail(token)
                if (response.success) {
                    setStatus("success")
                    setMessage("Email verified successfully! Redirecting to login...")
                    setTimeout(() => {
                        router.push("/login")
                    }, 3000)
                } else {
                    setStatus("error")
                    setMessage(response.message || "Verification failed. The link may have expired.")
                }
            } catch (error) {
                setStatus("error")
                setMessage("An error occurred during verification. Please try again later.")
            }
        }

        performVerification()
    }, [token, router])

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-[0.625rem] shadow-xl z-10 relative overflow-hidden">
            <div className="text-center space-y-6">
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="w-16 h-16 text-[#7000FE] animate-spin" />
                        <h1 className="text-2xl font-bold font-lato text-[#18181b]">Verifying Email</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="bg-green-50 p-4 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold font-lato text-[#18181b]">Verification Successful!</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="pt-4 flex items-center justify-center gap-2 text-[#7000FE] font-medium">
                            <span>Going to login</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="bg-red-50 p-4 rounded-full">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold font-lato text-[#18181b]">Verification Failed</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="flex flex-col w-full gap-3 pt-4">
                            {searchParams.get("email") && (
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-[#7000FE] text-[#7000FE] rounded-[0.625rem] font-medium hover:bg-purple-50 transition-colors disabled:opacity-50"
                                >
                                    {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Resend Verification Email
                                </button>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#f4f4f5] text-[#18181b] rounded-[0.625rem] font-medium hover:bg-[#e4e4e7] transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/signup")}
                                className="w-full py-3 bg-[#7000FE] text-white rounded-[0.625rem] font-medium hover:bg-[#5b00cf] transition-colors"
                            >
                                Go to Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="relative h-screen bg-[#6372FF] flex items-center justify-center overflow-hidden">
            <Image
                src="/bg-illust.png"
                alt="Background Illustration"
                width={1920}
                height={1080}
                className="w-full absolute top-0 left-0 object-cover rotate-180 opacity-50"
            />

            <Suspense fallback={
                <div className="w-full max-w-md p-8 bg-white rounded-[0.625rem] shadow-xl z-10 relative flex flex-col items-center gap-4 py-8">
                    <Loader2 className="w-16 h-16 text-[#7000FE] animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>

            <Image
                src="/bg-illust.png"
                alt="Background Illustration"
                width={1920}
                height={1080}
                className="w-full absolute bottom-0 left-0 object-cover opacity-50"
            />
        </div>
    )
}
