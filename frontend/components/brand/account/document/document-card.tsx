"use client"

import { deleteTutorDocumentAction } from "@/actions/account"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { TutorDocumentResponse } from "@/utils/types"
import { FileText, Maximize2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

type DocumentCardProps = {
  document?: TutorDocumentResponse
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getFileExtension = (url: string) => {
    return url.split(".").pop()?.toLowerCase() || ""
  }

  const isPdf = document ? getFileExtension(document.url) === "pdf" : false
  const isImage = document
    ? ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(getFileExtension(document.url))
    : false

  const handleExpandClick = () => {
    if (!document) return

    if (isImage) {
      setIsDialogOpen(true)
    } else {
      window.open(document.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!document?.id) return

    try {
      await deleteTutorDocumentAction(document.id)
      setIsDeleteDialogOpen(false)
      toast.success("Request to delete document submitted successfully")
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast.error("Failed to submit delete request. Please try again.")
    }
  }

  const renderContent = () => {
    if (!document) {
      return (
        <Image
          src="/mascoot.png"
          alt="Document content preview"
          width={640}
          height={560}
          className="w-full h-auto select-none pointer-events-none"
          priority
        />
      )
    }

    if (isPdf) {
      return (
        <div className="flex items-center justify-center h-[70%]">
          <div className="text-center">
            <FileText className="size-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xs">PDF</p>
          </div>
        </div>
      )
    }

    if (isImage) {
      return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="w-full h-full">
              <Image
                src={document.url}
                alt="Document content preview"
                width={640}
                height={560}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
              <Image
                src={document.url}
                alt="Document content preview"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
    }

    return (
      <Image
        src={document.url}
        alt="Document content preview"
        width={640}
        height={560}
        className="w-full h-auto select-none pointer-events-none"
        priority
      />
    )
  }

  return (
    <>
      <article
        className="relative w-full h-42 md:max-w-[90px] md:max-h-[130px] xl:max-w-[120px] xl:max-h-[160px] rounded-3xl border-[6px] border-[#B880FF] bg-card shadow-sm overflow-hidden"
        aria-label="Document preview card"
      >
        {renderContent()}

        {/* Bottom control bar overlay */}
        <div className="absolute bottom-0 right-0 rounded-tl-2xl bg-[#B880FF] text-primary-foreground flex items-center justify-evenly shadow-sm">
          <button
            type="button"
            aria-label="Delete document"
            className="inline-flex items-center justify-center xl:size-10 size-8 cursor-pointer"
            onClick={handleDeleteClick}
          >
            <Trash2 className="size-4 xl:size-5" />
          </button>
          <button
            type="button"
            aria-label="Expand preview"
            className="inline-flex items-center justify-center size-8 xl:size-12 cursor-pointer"
            onClick={handleExpandClick}
          >
            <Maximize2 className="size-4 xl:size-5" />
          </button>
        </div>
      </article>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Document Removal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to request removal of this document? Your request will be
              reviewed by our admin team before the document is removed.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={handleConfirmDelete}
            >
              Request Removal
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
