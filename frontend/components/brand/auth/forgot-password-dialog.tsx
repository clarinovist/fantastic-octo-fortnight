"use client"

import type React from "react"

import { forgotPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Send, X } from "lucide-react"
import { useState } from "react"

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await forgotPasswordAction(email)

      if (response.success) {
        setSuccess(true)
        setEmail("")
        // Optionally close dialog after a delay
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
        }, 3000)
      } else {
        setError(response.message || "Failed to send reset email. Please try again.")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl border-0 bg-white p-12 shadow-2xl sm:rounded-[2rem]"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-8 cursor-pointer top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="size-8 stroke-[3]" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Mail Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="51"
            viewBox="0 0 72 51"
            fill="none"
          >
            <path
              d="M7.95767 0H64.0423C69.3333 0 72 2.478 72 7.518V42.882C72 47.88 69.3333 50.4 64.0423 50.4H7.95767C2.66667 50.4 0 47.88 0 42.882V7.518C0 2.478 2.66667 0 7.95767 0ZM35.9788 36.12L64.5079 12.894C65.5238 12.054 66.328 10.122 65.0582 8.4C63.8307 6.678 61.5873 6.636 60.1058 7.686L35.9788 23.898L11.8942 7.686C10.4127 6.636 8.16931 6.678 6.9418 8.4C5.67196 10.122 6.47619 12.054 7.49206 12.894L35.9788 36.12Z"
              fill="#7000FE"
            />
          </svg>

          {/* Heading */}
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#6d28d9]">
            Forgot Password?
          </h2>

          {/* Description */}
          <p className="max-w-xl text-lg leading-relaxed text-black">
            Lupa kata sandi? Nggak masalah! Cukup masukkan email kamu, dan kami akan bantu kirim
            tautan untuk reset.
          </p>

          {/* Success Message */}
          {success && (
            <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Email reset password telah dikirim. Silakan cek inbox Anda.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email Input Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <Send className="size-7 text-[#6d28d9]" />
              </div>
              <Input
                type="email"
                placeholder="masukkan email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 rounded-lg border-main bg-white pl-16 pr-6 text-lg placeholder:text-[#c4b5fd] focus-visible:ring-[#6d28d9]"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-20 w-full rounded-[2rem] bg-[#6d28d9] text-xl font-bold uppercase tracking-wide text-white hover:bg-[#5b21b6] focus-visible:ring-[#6d28d9] focus-visible:ring-offset-0"
            >
              {isLoading ? "SENDING..." : "SEND EMAIL"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
