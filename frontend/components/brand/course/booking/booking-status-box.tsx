import { useCountdown } from "@/hooks/use-countdown"
import { Clock } from "lucide-react"

interface BookingStatusBoxProps {
  status: "pending" | "accepted" | "declined" | string
  expiredAt: string
  className?: string
}

export function BookingStatusBox({ status, expiredAt, className = "" }: BookingStatusBoxProps) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-[#B4B4B4]"
      case "accepted":
        return "bg-[#006312]"
      case "declined":
      case "expired":
        return "bg-[#A70000]"
      default:
        return "bg-[#B4B4B4]"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="w-6 h-6 mb-1" />
      case "accepted":
        return (
          <svg
            className="h-[48px] w-[48px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 40"
            fill="none"
          >
            <path
              d="M15.7548 39.5681L0 23.9279L7.1797 16.8003L15.7548 25.3383L40.8203 0.429688L48 7.55722L15.7548 39.5681Z"
              fill="white"
            />
          </svg>
        )
      case "declined":
      case "expired":
        return (
          <svg
            className="h-[48px] w-[48px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path
              d="M48 7.43662L40.5634 0L24 16.9014L7.43662 0L0 7.43662L16.9014 24L0 40.5634L7.43662 48L24 31.0986L40.5634 48L48 40.5634L31.0986 24L48 7.43662Z"
              fill="white"
            />
          </svg>
        )
      default:
        return <Clock className="w-6 h-6 mb-1" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Waiting"
      case "accepted":
        return "Accepted"
      case "declined":
        return "Rejected"
      case "expired":
        return "Expired"
      default:
        return "Unknown"
    }
  }

  const countdownValue = useCountdown(expiredAt)
  const countdown = status === "pending" && expiredAt ? countdownValue : null

  return (
    <div
      className={`${getStatusColor()} text-white flex flex-col items-center justify-center px-6 py-4 w-[120px] ${className}`}
    >
      {getStatusIcon()}
      <span className="text-sm font-bold uppercase">{getStatusText()}</span>
      {countdown && status === "pending" && (
        <span className="text-sm font-semibold">{countdown}</span>
      )}
    </div>
  )
}
