import type { FileItem } from "@/utils/types"
import React, { useRef, useState } from "react"
import { mutate } from "swr"
import { Icon } from "../ui/icon"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (uploadedFile: FileItem) => void
}

export const FilePicker: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return false
    }
    setError("")
    return true
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!validateFile(file)) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Trigger SWR revalidation for any file-related cache keys
      mutate(key => typeof key === 'string' && key.includes('/files'))
      
      onUpload?.(result.data)
      onClose()
    } catch (error) {
      console.error("Upload failed:", error)
      setError("Upload failed. Please try again.")
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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative w-[90%] max-w-4xl bg-[#BFBFBF] rounded-2xl shadow-lg border border-gray-200">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-black hover:opacity-70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div
          className={`flex flex-col items-center justify-center h-[450px] transition-colors border-2 border-dashed rounded-2xl m-4 ${
            isDragOver
              ? "bg-gray-300/50 border-gray-400"
              : "border-transparent hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Icon */}
          <div className="flex items-center justify-center text-gray-500">
            <Icon name="user-target" fill="#7D7D7D" />
          </div>

          {/* Text */}
          <p className="mt-4 text-gray-600 text-lg">
            {isUploading ? "Uploading..." : "drag image here"}
          </p>

          {/* Error Message */}
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload button */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-center">
          <div className="py-2 px-4 rounded-t-2xl bg-white">
            <button
              onClick={openFilePicker}
              disabled={isUploading}
              className="flex items-center gap-2 text-black font-medium disabled:opacity-50"
            >
              {isUploading ? "uploading..." : "upload image"}
              <Icon name="upload" fill="black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
