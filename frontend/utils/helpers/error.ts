import type { BaseResponse } from "@/utils/types"

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Check if it's a BaseResponse error
  if (error && typeof error === "object" && "success" in error) {
    const baseError = error as BaseResponse<unknown>
    if (!baseError.success && baseError.message) {
      return baseError.message
    }
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return error.message
  }

  // Check if it's a string
  if (typeof error === "string") {
    return error
  }

  // Check if it has a message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }

  // Fallback
  return "An unexpected error occurred"
}

/**
 * Type guard to check if response is a failed BaseResponse
 */
export function isBaseResponseError<T>(
  response: unknown
): response is BaseResponse<T> & { success: false } {
  return (
    response !== null &&
    typeof response === "object" &&
    "success" in response &&
    response.success === false
  )
}