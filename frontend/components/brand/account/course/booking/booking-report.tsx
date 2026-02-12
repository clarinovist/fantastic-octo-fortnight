"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import * as React from "react"

type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
}

export function ReportDialog({
  open,
  onOpenChange,
  bookingId,
}: ReportDialogProps) {
  const [topic, setTopic] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/students/booking/${bookingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes }),
      })
      if (!res.ok) {
        throw new Error("Failed to submit report")
      }
      setTopic("")
      setNotes("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white">
        <DialogHeader className="flex items-center justify-between flex-row">
          <DialogTitle className="text-2xl font-bold">Report</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col space-y-4">
          {/* Topik Laporan */}
          <div>
            <label className="font-semibold">Topik Laporan</label>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder=""
              className="mt-1 border-2 border-main focus:border-main rounded-md"
              disabled={loading}
            />
          </div>

          {/* Penjelasan */}
          <div>
            <label className="font-semibold">Penjelasan</label>
            <div className="relative">
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 150))}
                rows={4}
                placeholder=""
                className="mt-1 border-2 border-main focus:border-main rounded-md"
                disabled={loading}
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                {notes.length}/150
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Submit */}
          <Button
            className="w-full bg-main hover:bg-main/50 text-white font-semibold rounded-lg py-2"
            onClick={handleSubmit}
            disabled={loading || !topic || !notes}
          >
            {loading ? "Submitting..." : "SUBMIT"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
