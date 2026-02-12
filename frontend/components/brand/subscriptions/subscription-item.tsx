import { formatRupiah } from "@/utils/helpers"
import { Printer } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Subscription {
  id: string
  name: string
  status: "pending" | "active" | "expired" | "canceled"
  startTime: string
  nextBillingDate: string
  amount?: string
  url?: string
}

export function SubscriptionItem({ subscription }: { subscription: Subscription }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(`/api/v1/students/subscriptions/${subscription.id}/invoice`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to download invoice")
      }

      // Get content type and verify it's a PDF
      const contentType = response.headers.get("content-type")

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("content-disposition")
      let filename = `invoice-${subscription.name}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "")
        }
      }

      const blob = await response.blob()

      // Create blob with correct content type
      const pdfBlob = new Blob([blob], { type: contentType || "application/pdf" })

      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      alert("Gagal mengunduh invoice. Silakan coba lagi.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCancelPayment = async () => {
    try {
      setIsCanceling(true)
      const response = await fetch(`/api/v1/students/subscriptions/${subscription.id}/cancel`, {
        method: "POST",
      })

      const resp = await response.json()

      if (!response.ok || !resp.success) {
        throw new Error(resp?.message || "Failed to cancel payment")
      }

      toast.success("Pembayaran berhasil dibatalkan")
      // Optionally reload the page or update the subscription status
      window.location.reload()
    } catch (error) {
      console.error("Error canceling payment:", error)
      const err = error as unknown as { message?: string }
      if (err?.message) {
        toast.error(`Gagal membatalkan pembayaran: ${err.message}`)
        return
      }
      toast.error("Gagal membatalkan pembayaran. Silakan coba lagi.")
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex justify-between flex-wrap md:flex-nowrap items-center gap-4">
        {/* Title Row with Status Badge */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">{subscription.name}</h2>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              subscription.status === "active"
                ? "bg-[#006312] text-white"
                : subscription.status === "expired"
                  ? "bg-gray-400 text-white"
                  : subscription.status === "canceled"
                    ? "bg-gray-400 text-white"
                    : "bg-yellow-400 text-white"
            }`}
          >
            {subscription.status}
          </div>

          {/* Printer Icon */}
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="p-2 rounded-lg bg-[#BCBCBC] text-gray-600 hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={20} className={isDownloading ? "animate-pulse" : ""} />
          </button>
        </div>
        {/* Continue Payment if subscription.status === "pending" && subscription.url is exist */}
        <div>
          {subscription.status === "pending" && (
            <>
              <a
                href={subscription.url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lanjutkan Pembayaran
              </a>
              <button
                onClick={handleCancelPayment}
                disabled={isCanceling}
                className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? "Membatalkan..." : "Batalkan Pembayaran"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Waktu Langganan</span>
          <span className="text-gray-900 font-semibold">{subscription.startTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Tanggal Tagihan Selanjutnya</span>
          <span className="text-gray-900 font-semibold">{subscription.nextBillingDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Tagihan Selanjutnya</span>
          <span className="text-gray-900 font-semibold">
            {formatRupiah(subscription?.amount ?? 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
