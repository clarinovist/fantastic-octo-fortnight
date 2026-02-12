"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BaseResponse, FileResponse } from "@/utils/types";
import { File, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FieldWrapper } from "./field-wrapper";

interface FilePickerFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  onUploadComplete?: (file: FileResponse) => void;
}

export function FilePickerField({
  name,
  label,
  description,
  required,
  disabled,
  className,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUploadComplete,
}: FilePickerFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isImageFile = (filename: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileUpload = async (
    file: File,
    onChange: (value: FileResponse | null) => void
  ) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${formatFileSize(maxSize)}`);
      return;
    }

    // Create preview for images
    if (isImageFile(file.name)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const resJson = await response.json();

      // Support APIs that either return the FileResponse directly or wrap it in a BaseResponse<{ data: FileResponse }>
      const data: FileResponse =
        resJson && typeof resJson === "object" && "data" in resJson
          ? (resJson as BaseResponse<FileResponse>).data
          : (resJson as FileResponse);

      onChange(data);
      onUploadComplete?.(data);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      setPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (onChange: (value: FileResponse | null) => void) => {
    onChange(null);
    setPreview(null);
    setError(null);
  };

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <div className="space-y-2">
          {field.value ? (
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="shrink-0">
                  {preview ? (
                    <div className="relative w-20 h-20 rounded overflow-hidden border">
                      <Image
                        src={preview}
                        alt="Preview"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : isImageFile(field.value.filename) ? (
                    <div className="w-20 h-20 rounded border flex items-center justify-center bg-muted">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded border flex items-center justify-center bg-muted">
                      <File className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {field.value.filename}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(field.value.size)}
                  </p>
                  <a
                    href={field.value.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block cursor-pointer"
                  >
                    View file
                  </a>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(field.onChange)}
                  disabled={disabled || uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center",
                error && "border-destructive"
              )}
            >
              <input
                type="file"
                id={`file-input-${name}`}
                className="hidden"
                accept={accept}
                disabled={disabled || uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, field.onChange);
                  }
                  e.target.value = "";
                }}
              />
              <label
                htmlFor={`file-input-${name}`}
                className={cn(
                  "cursor-pointer",
                  (disabled || uploading) && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-muted-foreground" />
                  )}
                  <div className="text-sm">
                    <span className="text-primary font-medium">
                      {uploading ? "Uploading..." : "Click to upload"}
                    </span>
                    {!uploading && (
                      <span className="text-muted-foreground">
                        {" "}
                        or drag and drop
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {accept ? `Accepted: ${accept}` : "Any file type"}
                    {" • "}
                    Max size: {formatFileSize(maxSize)}
                  </p>
                </div>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </FieldWrapper>
  );
}
