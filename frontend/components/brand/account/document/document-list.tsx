"use client"

import { uploadTutorDocumentAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import type { TutorDocumentResponse } from "@/utils/types"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { DocumentCard } from "./document-card"

type DocumentListProps = {
  documents: TutorDocumentResponse[]
  className?: string
}

export function DocumentList(props: DocumentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = (file: File): boolean => {
    // Accept common document formats
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, Word document, or image file")
      return false
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return false
    }

    return true
  }

  const handleFileUpload = async (file: File) => {
    if (!file || !validateFile(file)) return

    setIsUploading(true)
    try {
      // First upload the file to get the URL
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
        next: { revalidate: 0 },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const uploadResult = await uploadResponse.json()
      const fileUrl = uploadResult.data.url

      // Then save the document via server action
      const documentFormData = new FormData()
      documentFormData.append("document", fileUrl)

      const saveResponse = await uploadTutorDocumentAction(documentFormData)

      if (!saveResponse.data) {
        throw new Error("Failed to save document")
      }

      // Trigger SWR revalidation for document-related cache keys
      mutate(key => typeof key === "string" && key.includes("/tutors/documents"))

      toast.success("Document uploaded successfully!")
    } catch (error) {
      console.error("Upload failed:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={props.className}>
      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-auto">
        {props.documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
        {props.documents.length === 0 && (
          <div className="col-span-full">
            <span>Klik tombol dibawah untuk menambahkan dokumen</span>
          </div>
        )}
      </div>
      <Button
        className="bg-[#D9D9D9] w-full hover:bg-[#D9D9D9] mt-4"
        onClick={openFileDialog}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M32 18.2857H18.2857V32H13.7143V18.2857H0V13.7143H13.7143V0H18.2857V13.7143H32V18.2857Z"
              fill="white"
            />
          </svg>
        )}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
