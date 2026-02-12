"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

type BookingCourseRejectActionProps = {
  bookingId: string
}

export function BookingCourseRejectAction({ bookingId }: BookingCourseRejectActionProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/booking/${bookingId}/decline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error("Failed to reject booking")
      setNotes("")
      if (res.ok) {
        toast.success("Booking rejected successfully")
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
          <Button className="bg-[#A70000]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
            >
              <path d="M2 2L18 16M18 2L2 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>DENY</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="bg-[#A70000] text-white flex gap-4 items-center w-fit rounded px-4 py-2 font-bold mb-4 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
            >
              <path d="M2 2L18 16M18 2L2 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>DENY</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="notes-reject" className="block mb-2 text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes-reject"
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
