"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

type BookingCourseAcceptActionProps = {
  bookingId: string
}

export function BookingCourseAcceptAction({ bookingId }: BookingCourseAcceptActionProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/booking/${bookingId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error("Failed to approve booking")
      setNotes("")
      if (res.ok) {
        toast.success("Booking approved successfully")
        window.location.reload()
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-[#006312]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
            >
              <path
                d="M6.56448 17.1534L0 10.6366L2.99154 7.66681L6.56448 11.2243L17.0085 0.845703L20 3.81551L6.56448 17.1534Z"
                fill="white"
              />
            </svg>
            <span>ACCEPT</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="bg-[#006312] text-white flex gap-4 items-center w-fit rounded px-4 py-2 font-bold mb-4 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
            >
              <path
                d="M6.56448 17.1534L0 10.6366L2.99154 7.66681L6.56448 11.2243L17.0085 0.845703L20 3.81551L6.56448 17.1534Z"
                fill="white"
              />
            </svg>
            <span>ACCEPT</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="notes" className="block mb-2 text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Add notes..."
              value={notes}
              className="min-h-32 border-main focus-visible:ring-main focus-visible:border-main focus-visible:ring-0"
              onChange={e => setNotes(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="w-full bg-main" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
