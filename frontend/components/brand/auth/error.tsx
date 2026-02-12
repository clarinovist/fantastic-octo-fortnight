"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface AuthErrorProps {
  error?: string | null
  message?: string | null
}

export function AuthError(props: AuthErrorProps) {
  const error = props.error
  const customMessage = props.message

  const getErrorMessage = (error?: string | null) => {
    // If there's a custom message from backend, use it
    if (customMessage) {
      try {
        return decodeURIComponent(customMessage)
      } catch (error) {
        // If decoding fails, return the message as-is
        console.warn("Failed to decode error message:", error)
        return customMessage
      }
    }

    switch (error) {
      case "Configuration":
        return "Terjadi kesalahan konfigurasi. Silakan hubungi administrator."
      case "AccessDenied":
        return "Akses ditolak. Anda tidak memiliki izin untuk mengakses aplikasi ini."
      case "Verification":
        return "Token verifikasi tidak valid atau telah kedaluwarsa."
      case "BackendError":
        return "Terjadi kesalahan pada server. Silakan coba lagi."
      case "NetworkError":
        return "Terjadi kesalahan jaringan. Periksa koneksi internet Anda."
      default:
        return "Terjadi kesalahan saat proses autentikasi. Silakan coba lagi."
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Autentikasi Gagal</h1>
          <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
