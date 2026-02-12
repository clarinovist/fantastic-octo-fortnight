import type { FileResponse } from "@/utils/types";
import React, { useRef, useState } from "react";
import { mutate } from "swr";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (uploadedFile: FileResponse) => void;
}

export const FilePicker: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return false;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }
    setError("");
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Trigger SWR revalidation for any file-related cache keys
      mutate((key) => typeof key === "string" && key.includes("/files"));

      onUpload?.(result.data);

      // Small delay to show 100% completion
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isUploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-picker-title"
    >
      <div className="relative w-[90%] max-w-4xl bg-linear-to-b from-[#D4D4D4] to-[#BFBFBF] rounded-2xl shadow-2xl border border-gray-300 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-4 right-4 z-10 text-gray-700 hover:text-black hover:bg-white/50 rounded-full p-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Close file picker"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        <div className="p-6">
          <h2
            id="file-picker-title"
            className="text-2xl font-semibold text-gray-800 mb-6 text-center"
          >
            Upload Image
          </h2>

          <div
            className={`
              relative flex flex-col items-center justify-center h-[400px] 
              transition-all duration-300 border-2 border-dashed rounded-xl
              ${
                isDragOver
                  ? "bg-white/60 border-gray-600 scale-[1.02]"
                  : isUploading
                  ? "bg-white/30 border-gray-400"
                  : "bg-white/20 border-gray-400 hover:bg-white/40 hover:border-gray-500 cursor-pointer"
              }
              ${isUploading ? "" : "group"}
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isUploading ? openFilePicker : undefined}
            role="button"
            tabIndex={isUploading ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isUploading) {
                e.preventDefault();
                openFilePicker();
              }
            }}
            aria-label="Drop zone for image upload"
          >
            {/* Upload Icon */}
            <div
              className={`transition-all duration-300 ${
                isUploading ? "opacity-50" : "group-hover:scale-110"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Text */}
            <p className="text-gray-700 text-xl font-medium mb-2">
              {isUploading
                ? "Uploading your image..."
                : "Drag & drop your image here"}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {isUploading ? "Please wait" : "or click to browse"}
            </p>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="w-full max-w-md px-8 mt-4">
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* File Requirements */}
            {!isUploading && !error && (
              <div className="absolute bottom-6 text-center">
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, WebP • Max size: 10MB
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {/* Upload button */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-center">
          <div className="py-3 px-6 rounded-t-2xl bg-white shadow-lg">
            <button
              onClick={openFilePicker}
              disabled={isUploading}
              className="flex items-center gap-3 text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-black transition-colors duration-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {isUploading ? "Uploading..." : "Choose File"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
